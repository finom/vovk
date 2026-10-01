const getVisiblePageSection = () => {
  function getVisibleText() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if an element or its ancestors are hidden from accessibility tree
    function isAccessibilityHidden(element: Element | null): boolean {
      while (element) {
        if (element.getAttribute('aria-hidden') === 'true') return true;
        if (element.hasAttribute('hidden')) return true;
        const role = element.getAttribute('role');
        if (role === 'presentation' || role === 'none') return true;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden')
          return true;
        element = element.parentElement;
      }
      return false;
    }

    // Get accessible name from aria-label or aria-labelledby
    function getAccessibleName(element: Element): string {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;

      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        return labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() || '')
          .filter(Boolean)
          .join(' ');
      }

      // For images, use alt text
      if (element.tagName === 'IMG') {
        const alt = element.getAttribute('alt');
        if (alt) return alt;
      }

      return '';
    }

    // Get aria-describedby text
    function getDescription(element: Element): string {
      const describedBy = element.getAttribute('aria-describedby');
      if (describedBy) {
        return describedBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() || '')
          .filter(Boolean)
          .join(' ');
      }
      return '';
    }

    const visibleTexts: string[] = [];
    const processedElements = new Set<Element>();

    // First, collect accessible names and descriptions from elements
    const allElements = document.body.querySelectorAll('*');
    for (const element of allElements) {
      if (isAccessibilityHidden(element)) continue;

      const rect = element.getBoundingClientRect();
      const isInViewport =
        rect.top < viewportHeight &&
        rect.bottom > 0 &&
        rect.left < viewportWidth &&
        rect.right > 0;

      if (!isInViewport) continue;

      const accessibleName = getAccessibleName(element);
      if (accessibleName && !processedElements.has(element)) {
        visibleTexts.push(accessibleName);
        processedElements.add(element);
      }

      const description = getDescription(element);
      if (description) {
        visibleTexts.push(description);
      }
    }

    // Then collect visible text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (isAccessibilityHidden(parent)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let node: Node | null;
    while (true) {
      node = walker.nextNode();
      if (!node) break;
      const range = document.createRange();
      range.selectNode(node);
      const rect = range.getBoundingClientRect();

      if (
        rect.top < viewportHeight &&
        rect.bottom > 0 &&
        rect.left < viewportWidth &&
        rect.right > 0
      ) {
        const text = node.textContent?.trim();
        if (text) {
          visibleTexts.push(text);
        }
      }
    }

    return visibleTexts.join(' ').replace(/\s+/g, ' ').trim();
  }

  return getVisibleText();
};

export { getVisiblePageSection };
