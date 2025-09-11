import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommandMenu } from '@/components/SlashCommandMenu';

export interface SlashCommandItem {
  id: string;
  title: string;
  description?: string;
  body: string;
  category?: string;
  tags: string[];
  isTemplate?: boolean;
}

export interface SlashCommandProps {
  items: SlashCommandItem[];
  onSelect: (item: SlashCommandItem) => void;
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      items: [],
      onSelect: () => {},
    };
  },

  addProseMirrorPlugins() {
    return [
      new (require('prosemirror-state').Plugin)({
        key: new (require('prosemirror-state').PluginKey)('slashCommand'),
        view: (view) => {
          let popup: TippyInstance | null = null;
          let component: ReactRenderer | null = null;
          let isOpen = false;

          const closePopup = () => {
            if (popup) {
              popup.hide();
              popup.destroy();
              popup = null;
            }
            if (component) {
              component.destroy();
              component = null;
            }
            isOpen = false;
          };

          const openPopup = (query: string = '') => {
            if (isOpen) return;
            
            const { from } = view.state.selection;
            const coords = view.coordsAtPos(from);
            
            component = new ReactRenderer(SlashCommandMenu, {
              props: {
                items: this.options.items,
                query,
                onSelect: (item: SlashCommandItem) => {
                  // Replace the slash and query with the selected item's body
                  const { state } = view;
                  const { from } = state.selection;
                  
                  // Find the start of the slash command
                  const $pos = state.doc.resolve(from);
                  let startPos = from;
                  
                  // Go back to find the slash
                  for (let i = from - 1; i >= Math.max(0, from - 20); i--) {
                    const char = state.doc.textBetween(i, i + 1);
                    if (char === '/') {
                      startPos = i;
                      break;
                    }
                    if (char === ' ' || char === '\n') {
                      break;
                    }
                  }
                  
                  // Replace the slash command with the template content
                  const tr = state.tr.replaceWith(
                    startPos,
                    from,
                    state.schema.text(item.body)
                  );
                  
                  view.dispatch(tr);
                  this.options.onSelect(item);
                  closePopup();
                },
                onClose: closePopup,
              },
              editor: view,
            });

            popup = tippy(document.body, {
              getReferenceClientRect: () => {
                const rect = {
                  width: 0,
                  height: 0,
                  top: coords.top,
                  bottom: coords.bottom,
                  left: coords.left,
                  right: coords.left,
                  x: coords.left,
                  y: coords.top,
                  toJSON: () => ({})
                } as DOMRect;
                return rect;
              },
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              theme: 'dark',
              maxWidth: 'none',
              zIndex: 9999,
            });

            isOpen = true;
          };

          return {
            update: (view, prevState) => {
              const { state } = view;
              const { selection } = state;
              
              if (!selection.empty) {
                closePopup();
                return;
              }

              const { from } = selection;
              const $pos = state.doc.resolve(from);
              
              // Get text before cursor to check for slash command
              const textBefore = $pos.parent.textBetween(
                Math.max(0, $pos.parentOffset - 20),
                $pos.parentOffset
              );
              
              const slashMatch = textBefore.match(/\/(\w*)$/);
              
              if (slashMatch) {
                const query = slashMatch[1] || '';
                if (!isOpen) {
                  openPopup(query);
                } else if (component) {
                  // Update the query in the existing popup
                  component.updateProps({ query });
                }
              } else {
                closePopup();
              }
            },
            destroy: () => {
              closePopup();
            },
          };
        },
      })
    ];
  },
});