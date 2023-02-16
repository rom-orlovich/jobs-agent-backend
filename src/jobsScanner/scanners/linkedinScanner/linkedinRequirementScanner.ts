export class LinkedinRequirementScanner {
  static getJobPostData() {
    const ul = Array.from(document.body.querySelectorAll<HTMLLIElement>('.show-more-less-html ul li'));

    if (ul.length === 0) {
      return document.body.querySelector<HTMLDivElement>('.show-more-less-html')?.textContent || '';
    }
    return ul
      .filter((el) => el.textContent)
      .map((el) => el.textContent)
      .join(' ');
  }
}
