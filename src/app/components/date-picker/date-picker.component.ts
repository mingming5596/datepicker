import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter, Input, OnInit, Output } from '@angular/core';
import { get } from 'lodash';
import { TimeService } from '../../services/time.service';

interface DatePickerItem {
  date: string;
  disable: boolean;
}

function getNumber(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
): number {
  return Number(get(object, keys, defaultVal));
}

function getString(
  object: any | object,
  keys: string | string[],
  defaultVal?: any
): string {
  return String(get(object, keys, defaultVal));
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.sass'
})
export class DatePickerComponent implements OnInit {

  @Output() dateChanged = new EventEmitter<string>();

  // 日期格式2020-05-22
  private _value = '';
  @Input()
  set value(input_data: string) {
    this._value = this.parseDateString(input_data);
  }
  get value(): string {
    return this._value;
  }

  // 日期格式2020-05-22
  private _minDate = '';
  @Input()
  set minDate(input_data: string) {
    this._minDate = this.parseDateString(input_data);
  }
  get minDate(): string {
    return this._minDate;
  }

  // 日期格式2020-05-22
  private _maxDate = '';
  @Input()
  set maxDate(input_data: string) {
    this._maxDate = this.parseDateString(input_data);
  }
  get maxDate(): string {
    return this._maxDate;
  }

  showValue = '';
  isShowPicker = false;
  pickerDays: DatePickerItem[] = [];

  get year(): number {
    return getNumber(this.showValue.split('-'), '0');
  }

  get month(): number {
    return getNumber(this.showValue.split('-'), '1');
  }

  get day(): number {
    const time = getString(this.showValue.split(' '), '0');
    return getNumber(time.split('-'), '2');
  }

  constructor(public timeService: TimeService) {}

  ngOnInit() {
  }

  showDatePicker() {
    this.isShowPicker = true;
    this.showValue = this.value;
    this.pickerDays = this.getPickerDays(this.showValue);
  }

  hideDatePicker() {
    this.isShowPicker = false;
  }

  handleMonth(count: number) {
    if (this.isDisableMonth(count)) {
      return;
    }
    const d = new Date(this.showValue);
    const currentMonth = d.getMonth();
    d.setDate(20);
    d.setMonth(currentMonth + count);
    const newYear = d.getFullYear();
    const newMonth = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
    const newLastDate = this.getLastDateInThisMonth(`${newYear}-${newMonth}-01`).getDate();
    const selectedDate = Number(this.value.split('-')[2]);
    const newDate = newLastDate < selectedDate ? newLastDate : selectedDate;
    const newDateParse = newDate < 10 ? `0${newDate}` : `${newDate}`;
    this.showValue = `${newYear}-${newMonth}-${newDateParse}`;
    this.pickerDays = this.getPickerDays(this.showValue);
  }

  stopPropagation(event: any) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.returnValue) {
      event.returnValue = false;
    }
  }

  changeDay(date: DatePickerItem) {
    if (date.disable === true || date.date === '') {
      return;
    }
    const month = this.month < 10 ? `0${this.month}` : `${this.month}`;
    const day = Number(date.date) < 10 ? `0${date.date}` : `${date.date}`;

    this.hideDatePicker();
    this.dateChanged.emit(`${this.year}-${month}-${day}`);
  }

  getPickerDays(date: string): DatePickerItem[] {
    const days: DatePickerItem[] = [];
    const lastDay = this.getLastDateInThisMonth(date);
    this.fillEmptyDays(lastDay.getDate(), lastDay.getDay(), days);
    this.setDaysFromThisMonth(lastDay.getDate(), days);
    return days;
  }

  isDisableMonth(count: number) {
    const d = new Date(this.showValue);
    const currentMonth = d.getMonth();
    d.setMonth(currentMonth + count);
    const newYear = d.getFullYear();
    const newMonth = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;

    const clickedMonth = {
      year: Number(newYear),
      month: Number(newMonth)
    };
    const minYear = Number(this.minDate.split('-')[0]);
    const maxYear = Number(this.maxDate.split('-')[0]);
    const minMonth = Number(this.minDate.split('-')[1]);
    const maxMonth = Number(this.maxDate.split('-')[1]);

    if (count < 0) {
      if (this.minDate) {
        if (clickedMonth.year < minYear) {
          return true;
        }
        if (clickedMonth.year === minYear && clickedMonth.month < minMonth) {
          return true;
        }
      }
    }

    if (count > 0) {
      if (this.maxDate) {
        if (clickedMonth.year > maxYear) {
          return true;
        }
        if (clickedMonth.year === maxYear && clickedMonth.month > maxMonth) {
          return true;
        }
      }
    }
    return false;
  }

  isActive(date: string): boolean {
    if (date === this.day.toString() && this.isCurrentMonth() && this.isCurrentYear()) {
      return true;
    }
    return false;
  }

  private isCurrentMonth() {
    const currentMonth = new Date(this.value).getMonth();
    const showMonth = new Date(this.showValue).getMonth();
    return currentMonth === showMonth;
  }

  private isCurrentYear(){
    const currentYear = new Date(this.value).getFullYear();
    const showYear = new Date(this.showValue).getFullYear();
    return currentYear === showYear;
  }

  private setDaysFromThisMonth(dateCount: number, days: DatePickerItem[]) {
    for (let i = 1; i <= dateCount; i++) {
      days.push({
        date: String(i),
        disable: this.isDisableItem(i)
      });
    }
  }

  private fillEmptyDays(total: number, count: number, days: DatePickerItem[]) {
    let emptyDays = count - (total % 7) + 1;

    if (emptyDays < 0) {
      emptyDays = 7 + emptyDays;
    }

    for (let i = 0; i < emptyDays; i++) {
      days.push({
        date: '',
        disable: false
      });
    }
  }

  private getLastDateInThisMonth(date: string) {
    const separateDay = date.split('-');
    const newDate = `${separateDay[0]}-${separateDay[1]}-20`;
    const time = new Date(newDate);
    time.setMonth(time.getMonth() + 1);
    time.setDate(0);
    return time;
  }

  private isDisableItem(date: number) {
    if (this.isOverMax(date) || this.isOverMin(date)) {
      return true;
    }
    return false;
  }

  private isOverMin(date: number) {
    const min = new Date(this.minDate);

    if (this.minDate === '') {
      return false;
    }
    if (min.getFullYear() !== this.year) {
      return false;
    }
    if ((min.getMonth() + 1) !== this.month) {
      return false;
    }
    return date < min.getDate();
  }

  private isOverMax(date: number) {
    const min = new Date(this.maxDate);

    if (this.maxDate === '') {
      return false;
    }
    if (min.getFullYear() !== this.year) {
      return false;
    }
    if ((min.getMonth() + 1) !== this.month) {
      return false;
    }
    return date > min.getDate();
  }

  isCorrectFormat(input_data: string): boolean {
    const reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
    return new RegExp(reg).test(input_data);
  }

  isCorrectDate(input_data: string): boolean {
    const time = getString(input_data.split(' '), '0');
    const date = getNumber(time.split('-'), '2');
    return new Date(input_data).getDate() === date;
  }

  parseDateString(dateString: string): string {
    if (
      !this.isCorrectFormat(dateString) ||
      !this.isCorrectDate(dateString)) {
      return this.timeService.dateTime.toString().slice(0, 10);
    }
    return dateString;
  }
}
