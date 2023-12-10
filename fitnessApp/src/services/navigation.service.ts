import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private selectInnerItemSource = new Subject<string>();

    selectInnerItem$ = this.selectInnerItemSource.asObservable();

    selectInnerItem(innerItem: string) {
        this.selectInnerItemSource.next(innerItem);
    }
}
