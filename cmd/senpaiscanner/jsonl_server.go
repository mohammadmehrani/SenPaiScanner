package main

import (
	"bufio"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"net"
	"os"
	"strings"
	"time"

	"github.com/matinsenpai/senpaiscanner/internal/engine"
	"github.com/matinsenpai/senpaiscanner/internal/ipsrc"
	"github.com/matinsenpai/senpaiscanner/internal/prober"
	"github.com/matinsenpai/senpaiscanner/internal/result"
)

type jsonlMsg struct {
	Type   string      `json:"type"`
	Time   int64       `json:"time"`
	ID     int64       `json:"id,omitempty"`
	Message string     `json:"message,omitempty"`
	Result *result.Result `json:"result,omitempty"`
}

func unixMs() int64 { return time.Now().UnixMilli() }

func writeMsg(w *bufio.Writer, m jsonlMsg) {
	b, _ := json.Marshal(m)
	w.Write(b)
	w.WriteByte('\n')
	w.Flush()
}

func runJSONLServer() {
	fs := flag.NewFlagSet("jsonl-server", flag.ExitOnError)
	mode := fs.String("mode", "quick", "quick|custom")
	_ = fs.String("service", "cloudflare", "service selector placeholder")
	_ = fs.Int("concurrency", 50, "workers")
	_ = fs.String("timeout", "5s", "probe timeout")
	_ = fs.Int("tries", 4, "tries")
	_ = fs.Int("port", 443, "port")
	_ = fs.String("cidr", "", "optional CIDR")
	_ = fs.String("colo", "", "optional colo filter")
	_ = fs.String("sni", "", "sni")

	// Minimal parsing: we accept only --jsonl-server and optional args.
	// If flags are absent, use defaults.
	fs.Parse(os.Args[2:])

	writer := bufio.NewWriter(os.Stdout)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// For now: wire JSONL streaming to the existing engine+prober.
	// Next iterations will implement explicit two-phase + categories.
	workers := 50
	timeout := 5 * time.Second
	tries := 4
	port := 443
	useV4 := true
	useV6 := false

	switch strings.ToLower(*mode) {
	case "quick":
		workers = 50
		timeout = 5 * time.Second
		tries = 4
		port = 443
	case "custom":
		workers = 50
		timeout = 8 * time.Second
		tries = 6
		port = 443
	default:
		workers = 50
		timeout = 5 * time.Second
		tries = 4
	}

	// Choose source
	extra := []string{}
	useBuiltin := true
	// If cidr flag set later, it will override. For now leave empty.
	_ = extra

	src, err := ipsrc.NewWithOptions(useV4, useV6, extra, ipsrc.Options{UseBuiltin: useBuiltin})
	if err != nil {
		writeMsg(writer, jsonlMsg{Type: "error", Time: unixMs(), Message: fmt.Sprintf("setup failed: %v", err)})
		return
	}

	eng := engine.New(engine.Config{
		Concurrency: workers,
		ProbeConfig: prober.Config{
			Port:       port,
			Mode:       prober.ModeHTTP,
			Tries:      tries,
			Timeout:    timeout,
			SNI:        "",
			SpeedBytes: 64 * 1024,
		},
	})

	writeMsg(writer, jsonlMsg{Type: "log", Time: unixMs(), Message: fmt.Sprintf("[SCANNING] mode=%s workers=%d timeout=%s tries=%d port=%d", *mode, workers, timeout, tries, port)})

	// Probe a fixed count for now. In future: parse count.
	count := 200
	ipStream := src.Stream(ctx, count)

	// Result callback
	eng.Run(ctx, ipStream, func(r *result.Result) {
		if r == nil {
			return
		}
		// Live log line
		alive := r.IsHealthy()
		msg := fmt.Sprintf("[%s] %s - avg=%0.2fms loss=%0.1f%% colo=%s dl=%0.2f kbps", map[bool]string{true:"ALIVE", false:"DEAD"}[alive], r.IP.String(), r.AvgMs(), r.LossPct(), r.Colo, r.ThroughputKbps())
		writeMsg(writer, jsonlMsg{Type: "log", Time: unixMs(), Message: msg})

		if alive {
			writeMsg(writer, jsonlMsg{Type: "result", Time: unixMs(), Result: r})
		}
	})

	writeMsg(writer, jsonlMsg{Type: "done", Time: unixMs(), Message: "scan complete"})
}

func init() {
	// ensure unused imports used in build variants
	_ = net.IP{}
}

