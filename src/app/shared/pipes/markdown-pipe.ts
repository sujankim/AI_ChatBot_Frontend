import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    // Convert markdown to HTML
    const html = marked.parse(value) as string;

    // DomSanitizer marks this HTML as safe to render
    // (bypasses Angular's XSS protection — only use on trusted content)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
