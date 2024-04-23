import { Injectable } from '@angular/core';
import { interval, Subject, Observable, Subscription } from 'rxjs';
import { DateTime } from '../components/date-picker/dateTime';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private _isSkipInterval = false;
  dateTime: DateTime;
  tick$: Subject<number>;

  subscriptions: Subscription[] = [];
  oldUpdateTime = 0;
  constructor() {
    this.dateTime = new DateTime();
    this.tick$ = new Subject<number>();
  }

  initialize(): Observable<boolean> {
    return new Observable(subscribe => {
      this.dateTime.setTimezoneOffset(-480);
      this.dateTime.setTime(Math.floor(Date.now())
    );
      this.runTimer();
      this.setSynchronisedTime();

      subscribe.next(true);
      subscribe.complete();
    });
  }

  skipInterval(skip: boolean) {
    this._isSkipInterval = skip;
  }

  private setSynchronisedTime() {
    this.subscriptions[0] = interval(10000).subscribe(() => {
      if (this._isSkipInterval) {
        return;
      }
    });
  }

  private runTimer() {
    this.subscriptions[0] = interval(1000).subscribe(() => {
      let nextTick = 0;
      if(this.oldUpdateTime === 0){
        nextTick = this.dateTime.getTime() + 1000;
        this.oldUpdateTime = new Date().getTime();
      } else {
        const currentUpdateTime = new Date().getTime();
        nextTick = this.dateTime.getTime() + ( currentUpdateTime - this.oldUpdateTime) ;
        this.oldUpdateTime = new Date().getTime();
      }
      this.dateTime.setTime(nextTick);

      this.tick$.next(nextTick);
    });
  }
}
