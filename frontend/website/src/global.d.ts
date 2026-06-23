import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        behavior?: string;
        direction?: string;
        scrollamount?: string | number;
      };
    }
  }
}
