import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import moment from 'moment';
import * as bootstrap from 'bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule, CurrencyPipe } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [CurrencyPipe],
})
export class HomeComponent implements OnInit {
  courses: any[] = [];
  modalTitle = '';
  CourseId = 0;
  searchText: string = '';
  p: number = 1;
  courseForm: FormGroup;

  currencies: string[] = [
    'USD',
    'EUR',
    'GBP',
    'INR',
    'JPY',
    'CNY',
    'AUD',
    'CAD',
    'CHF',
    'SEK',
    'NZD',
    'MXN',
    'SGD',
    'HKD',
    'NOK',
    'KRW',
    'TRY',
    'RUB',
    'BRL',
    'ZAR',
  ]; // List of currency codes

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe
  ) {
    // Inject CurrencyPipe
    const currentDate = moment().format('YYYY-MM-DD');
    this.courseForm = this.fb.group({
      CourseName: [
        { value: '', disabled: this.CourseId != 0 },
        [Validators.required, Validators.maxLength(100)],
      ],
      University: [
        { value: '', disabled: this.CourseId != 0 },
        [Validators.required, Validators.maxLength(50)],
      ],
      Country: [
        { value: '', disabled: this.CourseId != 0 },
        [Validators.required, Validators.maxLength(50)],
      ],
      City: [
        { value: '', disabled: this.CourseId != 0 },
        [Validators.required, Validators.maxLength(50)],
      ],
      Currency: ['', [Validators.required, Validators.maxLength(10)]],
      Price: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,2})?$')],
      ],
      StartDate: [currentDate, Validators.required],
      EndDate: [currentDate, Validators.required],
      CourseDescription: ['', [Validators.required, Validators.maxLength(500)]],
    });
    this.courseForm.controls['EndDate'].setValidators([
      Validators.required,
      this.dateOrderValidator(this.courseForm.controls['StartDate']),
    ]);
  }

  ngOnInit(): void {
    this.refreshList();
    this.initializeTooltips();
  }

  initializeTooltips() {
    setTimeout(() => {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
      );
    }, 500);
  }

  refreshList() {
    this.http.get<any>(environment.apiUrl + 'course').subscribe((data) => {
      this.courses = Array.isArray(data) ? data : [];
      this.initializeTooltips();
    });
  }

  addClick() {
    this.modalTitle = 'Add Course';
    this.CourseId = 0;
    this.courseForm.reset();
    const currentDate = moment().format('YYYY-MM-DD');
    this.courseForm.patchValue({
      StartDate: currentDate,
      EndDate: currentDate,
    });
  }

  editClick(course: any) {
    this.modalTitle = 'Edit Course';
    this.CourseId = course.CourseId;
    this.courseForm.patchValue({
      CourseName: course.CourseName,
      University: course.University,
      Country: course.Country,
      City: course.City,
      Currency: course.Currency,
      Price: course.Price,
      StartDate: course.StartDate,
      EndDate: course.EndDate,
      CourseDescription: course.CourseDescription,
    });
  }

  createClick() {
    if (this.courseForm.invalid) {
      return;
    }

    const val = this.courseForm.getRawValue();

    this.http.post(environment.apiUrl + 'course/', val).subscribe({
      next: (res) => {
        alert(res.toString());
        this.refreshList();
        this.hideModal();
      },
      error: (err) => {
        console.error('Error creating course', err);
        alert('Failed to create course');
      },
    });
  }

  updateClick() {
    if (this.courseForm.invalid) {
      return;
    }

    const val = { ...this.courseForm.getRawValue(), CourseId: this.CourseId };

    this.http.put(environment.apiUrl + 'course/', val).subscribe({
      next: (res) => {
        alert(res.toString());
        this.refreshList();
        this.hideModal();
      },
      error: (err) => {
        console.error('Error updating course', err);
        alert('Failed to update course');
      },
    });
  }

  deleteClick(id: any) {
    if (confirm('Are you sure?')) {
      this.http.delete(environment.apiUrl + 'course/' + id).subscribe({
        next: (res) => {
          alert(res.toString());
          this.refreshList();
        },
        error: (err) => {
          console.error('Error deleting course', err);
          alert('Failed to delete course');
        },
      });
    }
  }

  getLength(startDate: string, endDate: string): string {
    const start = moment(startDate);
    const end = moment(endDate);
    const duration = moment.duration(end.diff(start));
    return `${duration.days()} days`;
  }

  filteredCourses() {
    return Array.isArray(this.courses)
      ? this.courses.filter((course: any) => {
          return (
            course.CourseName.toLowerCase().includes(
              this.searchText.toLowerCase()
            ) ||
            course.CourseDescription.toLowerCase().includes(
              this.searchText.toLowerCase()
            ) ||
            course.University.toLowerCase().includes(
              this.searchText.toLowerCase()
            ) ||
            course.Country.toLowerCase().includes(
              this.searchText.toLowerCase()
            ) ||
            course.City.toLowerCase().includes(this.searchText.toLowerCase()) ||
            course.Currency.toLowerCase().includes(
              this.searchText.toLowerCase()
            )
          );
        })
      : [];
  }

  hideModal() {
    $('#exampleModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      return;
    }
    if (this.CourseId == 0) {
      this.createClick();
    } else {
      this.updateClick();
    }
  }

  dateOrderValidator(startDateControl: AbstractControl): ValidatorFn {
    return (endDateControl: AbstractControl): { [key: string]: any } | null => {
      const startDate = startDateControl.value;
      const endDate = endDateControl.value;
      return startDate && endDate && startDate > endDate
        ? { dateOrder: true }
        : null;
    };
  }
}
