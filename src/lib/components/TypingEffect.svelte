<script lang="ts">
  import { onMount } from 'svelte';
  
  // Typing effect variables
  let displayedHeading = $state('');
  let displayedParagraph = $state('');
  let cursorVisible = $state(true);
  
  const headingText = "Welcome Artist!";
  const paragraphText = "Please sign in to continue sharing your creativity.";
  const typingSpeed = 50;
  const cursorBlinkSpeed = 530;
  
  onMount(() => {
    typeText();
    
    // Cursor blink
    const cursorInterval = setInterval(() => {
      cursorVisible = !cursorVisible;
    }, cursorBlinkSpeed);
    
    return () => clearInterval(cursorInterval);
  });
  
  async function typeText() {
    // Type heading
    for (let i = 0; i < headingText.length; i++) {
      displayedHeading = headingText.slice(0, i + 1);
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Type paragraph
    for (let i = 0; i < paragraphText.length; i++) {
      displayedParagraph = paragraphText.slice(0, i + 1);
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
  }
</script>

<h2 class="font-['Hanken_Grotesk'] font-semibold text-900 text-lg mb-2 min-h-6">
  {displayedHeading}
  {#if cursorVisible && displayedHeading.length < headingText.length}
    <span class="typing-cursor">|</span>
  {/if}
</h2>
<p class="text-txt-muted text-sm leading-relaxed min-h-12">
  {displayedParagraph}
  {#if cursorVisible && displayedParagraph.length < paragraphText.length}
    <span class="typing-cursor">|</span>
  {/if}
</p>

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .typing-cursor {
    display: inline-block;
    margin-left: 2px;
    animation: blink 1s infinite;
    color: currentColor;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
</style>
