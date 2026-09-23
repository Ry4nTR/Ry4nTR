import { el, icon, clear } from '../core/dom.js';

/**
 * Accessible tabs (role="tablist" + arrow-key navigation).
 *
 *   const tabs = createTabs(container, { panelId: 'grid', onSelect: (id) => … });
 *   tabs.setTabs([{ id, label, icon, count }, …], selectedId);
 *   tabs.select('game', { notify: false });   // change selection without calling onSelect
 */
export function createTabs(container, { onSelect, panelId } = {}) {
  let tabs = [];
  let selectedId = null;

  const buttons = () => Array.from(container.querySelectorAll('[role="tab"]'));

  function paintSelection() {
    buttons().forEach((button) => {
      const isSelected = button.dataset.tab === selectedId;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
  }

  function select(id, { notify = true } = {}) {
    if (id === selectedId) return;
    selectedId = id;
    paintSelection();
    if (notify) onSelect?.(id);
  }

  function render() {
    clear(container);
    tabs.forEach((tab) => {
      container.append(
        el(
          'button',
          {
            class: 'tabs__tab',
            type: 'button',
            role: 'tab',
            id: `tab-${tab.id}`,
            'aria-controls': panelId,
            dataset: { tab: tab.id },
            onClick: () => select(tab.id),
          },
          [
            tab.icon && icon(tab.icon),
            el('span', { class: 'tabs__label', text: tab.label }),
            el('span', { class: 'tabs__count', text: String(tab.count) }),
          ],
        ),
      );
    });
    paintSelection();
  }

  container.setAttribute('role', 'tablist');

  container.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const list = buttons();
    const index = list.findIndex((button) => button.dataset.tab === selectedId);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % list.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + list.length) % list.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = list.length - 1;

    event.preventDefault();
    list[next].focus();
    select(list[next].dataset.tab);
  });

  return {
    setTabs(nextTabs, selected = selectedId ?? nextTabs[0]?.id) {
      tabs = nextTabs;
      selectedId = selected;
      render();
    },
    select,
    get selected() {
      return selectedId;
    },
  };
}
