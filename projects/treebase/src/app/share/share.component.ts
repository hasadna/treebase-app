import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.less']
})
export class ShareComponent {

  constructor(private snackBar: MatSnackBar) { }

  async mobileShare() {
    const shareData = {
      text: 'יע״ד - בסיס נתונים לאומי ליער העירוני',
      url: window.location.href,
    };
    try {
        await navigator.share(shareData);
        return false;
    } catch (err) {
      return this.clipboardCopy();
    }
  }
  
  clipboardCopy(): boolean {
    if (!document.queryCommandSupported && document.queryCommandSupported('copy')) {
      return false;
    }
    const text = window.location.href;
    const txt = document.createElement('textarea');
    txt.textContent = text;
    txt.classList.add('visually-hidden');
    document.body.appendChild(txt);
    txt.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (ex) {
    } finally {
      document.body.removeChild(txt);
    }
    return false;
  }

  async doShare() {
    if (await this.mobileShare()) {
      this.snackBar.open('קישור לעמוד הנוכחי הועתק ללוח', 'תודה', {duration: 5000});
    }
  }
}
