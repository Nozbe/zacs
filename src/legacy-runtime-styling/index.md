# legacy-runtime-styling

This folder contains a copy of the old component styling library we've made at Nozbe.

We don't use it anymore, and neither should you.

But we're publishing its source code, because you can treat it as a insurance policy for ZACS. If you fear that ZACS will stop being maintained or that you'll have to stop using Babel transformations in the future, here is a library with mostly compatible API (small codemoddable adjustments might be necessary) that you can use to replace ZACS.

We're also publishing a codemod (`zacsify.js`) we've used to replace 700+ instances of our old styled component declarations to ZACS.
