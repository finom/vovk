import nextra from 'nextra';
import { codeThemes } from '../../docs/src/theme/code-theme.mjs';

// The code themes are vovk.dev's, from docs/src/theme.
const withNextra = nextra({
  mdxOptions: {
    rehypePrettyCodeOptions: { theme: codeThemes },
  },
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here
});
