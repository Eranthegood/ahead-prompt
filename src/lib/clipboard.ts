export async function copyText(text: string): Promise<boolean> {
  const inIframe = window !== window.top;
  const hasClipboard = !!navigator?.clipboard;
  const isSecure = window.isSecureContext;

  const isClipboardWriteAllowed = (() => {
    try {
      const anyDoc: any = document as any;
      if (anyDoc?.permissionsPolicy?.allowsFeature) {
        return anyDoc.permissionsPolicy.allowsFeature('clipboard-write');
      }
      if (anyDoc?.featurePolicy?.allowsFeature) {
        return anyDoc.featurePolicy.allowsFeature('clipboard-write');
      }
      if (typeof anyDoc?.featurePolicy?.allowedFeatures === 'function') {
        return anyDoc.featurePolicy.allowedFeatures().includes('clipboard-write');
      }
    } catch {}
    return undefined;
  })();

  console.debug('Clipboard: Attempting to copy', { 
    textLength: text.length, 
    isSecure, 
    hasClipboard,
    inIframe,
    isClipboardWriteAllowed
  });

  // Primary method: modern clipboard API (only if not explicitly disallowed)
  if (hasClipboard && isSecure && isClipboardWriteAllowed !== false) {
    try {
      await navigator.clipboard.writeText(text);
      console.debug('Clipboard: Success via navigator.clipboard');
      return true;
    } catch (error: any) {
      console.debug('Clipboard: navigator.clipboard failed', error);
      if (String(error?.name) === 'NotAllowedError' || String(error?.message || '').includes('Permissions policy')) {
        return manualCopy(text);
      }
    }
  }

  // Fallback: textarea + execCommand (skip if policy explicitly disallows)
  if (isClipboardWriteAllowed !== false) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(textarea);

      textarea.focus();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        console.debug('Clipboard: Success via execCommand');
        return true;
      }
    } catch (error: any) {
      console.debug('Clipboard: execCommand failed', error);
      if (String(error?.name) === 'NotAllowedError') {
        return manualCopy(text);
      }
    }
  }

  // Final fallback: manual copy via prompt
  return manualCopy(text);
}

function manualCopy(text: string): boolean {
  try {
    const message = 'Copiez manuellement (Ctrl/Cmd+C), puis validez pour continuer :';
    const res = window.prompt(message, text);
    const ok = res !== null;
    console.debug('Clipboard: Manual copy prompt used', { ok });
    return ok;
  } catch (e) {
    console.debug('Clipboard: Manual prompt failed', e);
    return false;
  }
}
