/**
 * Utility to convert Markdown to HTML using the same logic as MarkdownEditor
 * This ensures consistency between preview and production rendering
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;
  
  // Process images first (before line processing)
  html = html.replace(/!\[([^\]]*?)\]\(([^)]*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-4 shadow-md" style="display: block; margin: 1rem auto;" />');
  
  // Headers
  html = html
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-foreground border-b pb-2">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 text-foreground">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2 text-foreground">$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-medium mb-2 text-foreground">$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5 class="text-base font-medium mb-1 text-foreground">$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6 class="text-sm font-medium mb-1 text-foreground">$1</h6>')
    
    // Bold and italic
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks
    .replace(/```([^`]+)```/g, '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="text-sm">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r-md my-4 text-muted-foreground italic">$1</blockquote>')
    
    // Links
    .replace(/\[([^\]]*?)\]\(([^)]*?)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-border my-6" />');

  // Process line by line for lists and paragraphs
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip lines that are already processed images
    if (trimmedLine.startsWith('<img ')) {
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      processedLines.push(line);
      continue;
    }
    
    // Unordered list items
    if (trimmedLine.match(/^[\*\-\+] /)) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        processedLines.push('<ul class="list-disc list-inside my-4 space-y-2 text-foreground">');
        inUnorderedList = true;
      }
      const listItemText = trimmedLine.replace(/^[\*\-\+] /, '');
      processedLines.push(`<li class="ml-4">${listItemText}</li>`);
    }
    // Ordered list items
    else if (trimmedLine.match(/^\d+\. /)) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        processedLines.push('<ol class="list-decimal list-inside my-4 space-y-2 text-foreground">');
        inOrderedList = true;
      }
      const listItemText = trimmedLine.replace(/^\d+\. /, '');
      processedLines.push(`<li class="ml-4">${listItemText}</li>`);
    }
    // Regular content
    else {
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      
      // Handle paragraphs and line breaks
      if (trimmedLine === '') {
        processedLines.push('<br class="my-2" />');
      } else if (!trimmedLine.match(/^<[hH][1-6]|^<blockquote|^<pre|^<hr|^<img/)) {
        processedLines.push(`<p class="text-foreground mb-3 leading-relaxed">${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
  }

  // Close any remaining lists
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }
  if (inOrderedList) {
    processedLines.push('</ol>');
  }

  return processedLines.join('\n');
}