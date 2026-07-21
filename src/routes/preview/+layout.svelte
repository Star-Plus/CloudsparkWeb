<script lang="ts">
    let {children} : {children: () => any} = $props();
	import { MockContext, setMockContext } from "$lib/utils/mock/MockContext.svelte";


    const mockContext = new MockContext();
    setMockContext(mockContext);

</script>

{@render children()}