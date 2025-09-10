export async function copyText(text: string): Promise<boolean> {
  console.debug('Clipboard: Attempting to copy text', { 
    textLength: text.length, 
    isSecureContext: window.isSecureContext, 
    hasClipboard: !!navigator?.clipboard,
    inIframe: window !== window.top
  });

  // Primary method: modern clipboard API
  try {
    if (navigator?.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.debug('Clipboard: Success via navigator.clipboard');
      return true;
    } else {
      console.debug('Clipboard: Navigator.clipboard not available', {
        hasClipboard: !!navigator?.clipboard,
        isSecureContext: window.isSecureContext
      });
    }
  } catch (error) {
    console.debug('Clipboard: Navigator.clipboard failed', error);
  }

  // Fallback method: textarea + execCommand (for iframe/insecure contexts)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
    document.body.appendChild(textarea);
    
    // Focus and select text
    textarea.focus();
    textarea.setSelectionRange(0, textarea.value.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      console.debug('Clipboard: Success via execCommand fallback');
      return true;
    } else {
      console.debug('Clipboard: execCommand returned false');
      return false;
    }
  } catch (error) {
    console.debug('Clipboard: execCommand fallback failed', error);
    return false;
  }
}
