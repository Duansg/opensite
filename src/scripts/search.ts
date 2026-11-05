type SearchPost = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  url: string;
};
export function initSearch() {
  const dialog = document.querySelector<HTMLDialogElement>('.search-dialog');
  const input = document.querySelector<HTMLInputElement>('#global-search');
  const results = document.querySelector<HTMLElement>('#search-results');
  if (!dialog || !input || !results) return;
  let index: Promise<SearchPost[]> | undefined;
  let request = 0;
  let lastFocus: HTMLElement | null = null;
  function loadIndex() {
    index ??= fetch('/search.json')
      .then((response) => {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json() as Promise<SearchPost[]>;
      })
      .catch((error) => {
        index = undefined;
        throw error;
      });
    return index;
  }
  function open() {
    if (dialog!.open) return;
    lastFocus = document.activeElement as HTMLElement;
    dialog!.showModal();
    document.body.classList.add('dialog-open');
    input!.focus();
  }
  document
    .querySelectorAll('[data-search-open]')
    .forEach((button) => button.addEventListener('click', open));
  document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    lastFocus?.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });
  input.addEventListener('input', async () => {
    const currentRequest = ++request;
    const query = input.value.trim().toLocaleLowerCase();
    results.replaceChildren();
    if (!query) {
      results.textContent = '输入关键词，探索这个小小的数字花园。';
      return;
    }
    results.textContent = '搜索中…';
    try {
      const data = await loadIndex();
      if (currentRequest !== request) return;
      const terms = query.split(/\s+/);
      const matches = data
        .filter((post) =>
          terms.every((term) =>
            `${post.title} ${post.description} ${post.category} ${post.tags.join(' ')} ${post.body}`
              .toLocaleLowerCase()
              .includes(term),
          ),
        )
        .sort(
          (a, b) =>
            Number(b.title.toLocaleLowerCase().includes(query)) -
            Number(a.title.toLocaleLowerCase().includes(query)),
        );
      results.replaceChildren();
      if (!matches.length) {
        results.textContent = '没有找到相关文章，试试其他关键词。';
        return;
      }
      const count = document.createElement('p');
      count.className = 'label search-count';
      count.textContent = `${matches.length} 篇文章`;
      results.append(count);
      matches.forEach((post) => {
        const link = document.createElement('a');
        link.href = post.url;
        link.className = 'search-result';
        const category = document.createElement('span');
        category.className = 'label';
        category.textContent = `${post.category} ↗`;
        const title = document.createElement('strong');
        title.textContent = post.title;
        const description = document.createElement('p');
        description.textContent = post.description;
        link.append(category, title, description);
        results.append(link);
      });
    } catch {
      if (currentRequest === request)
        results.textContent = '搜索暂时不可用，请稍后重试，或前往文章归档浏览。';
    }
  });
  dialog.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll<HTMLAnchorElement>('a')];
    if (!links.length) return;
    const position = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[(position + 1) % links.length].focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (position <= 0) input.focus();
      else links[position - 1].focus();
    }
    if (event.key === 'Enter' && document.activeElement === input) {
      event.preventDefault();
      links[0].click();
    }
  });
  document
    .querySelector('.search-form')
    ?.addEventListener('submit', (event) => event.preventDefault());
}
