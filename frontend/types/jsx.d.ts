// Ensure JSX intrinsic elements are known for TS in this environment.
// Next.js normally provides these via its types, but this repo may miss them.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

