import { Component } from '@angular/core';

@Component({
  selector: 'app-feria-page',
  standalone: true,
  templateUrl: './feria-page.component.html',
  styleUrls: ['./feria-page.component.css']
})
export class FeriaPageComponent {

  toggleFrame(event: Event) {
    const icon = event.target as HTMLImageElement;
    const frame = icon.closest('.frame') as HTMLElement;

    // Toggle between expanded and collapsed states
    if (frame.classList.contains('expanded')) {
      frame.classList.remove('expanded');
      frame.classList.add('collapsed');
    } else {
      // Collapse all frames
      document.querySelectorAll('.frame').forEach(f => {
        f.classList.remove('expanded');
        f.classList.add('collapsed');
      });

      // Expand the clicked frame
      frame.classList.remove('collapsed');
      frame.classList.add('expanded');
    }
  }
}
