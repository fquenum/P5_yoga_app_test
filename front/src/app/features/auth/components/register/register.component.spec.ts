import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: any;
  let router: Router;

  beforeEach(async () => {
    // Créer le mock
    authService = {
      register: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    
    
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.form.value).toEqual({
        email: '',
        firstName: '',
        lastName: '',
        password: ''
      });
    });

    it('should have invalid form when empty', () => {
      expect(component.form.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email field as required', () => {
      const emailControl = component.form.get('email');
      
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();
      
      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('required')).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.form.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate firstName as required', () => {
      const firstNameControl = component.form.get('firstName');
      
      firstNameControl?.setValue('');
      expect(firstNameControl?.hasError('required')).toBeTruthy();
      
      firstNameControl?.setValue('John');
      expect(firstNameControl?.hasError('required')).toBeFalsy();
    });

    it('should validate firstName minimum length', () => {
      const firstNameControl = component.form.get('firstName');
      
      firstNameControl?.setValue('Jo');
      expect(firstNameControl?.hasError('minlength')).toBeTruthy();
      
      firstNameControl?.setValue('John');
      expect(firstNameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate firstName maximum length', () => {
      const firstNameControl = component.form.get('firstName');
      const longName = 'a'.repeat(21);
      
      firstNameControl?.setValue(longName);
      expect(firstNameControl?.hasError('maxlength')).toBeTruthy();
      
      firstNameControl?.setValue('a'.repeat(20));
      expect(firstNameControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should validate lastName as required', () => {
      const lastNameControl = component.form.get('lastName');
      
      lastNameControl?.setValue('');
      expect(lastNameControl?.hasError('required')).toBeTruthy();
      
      lastNameControl?.setValue('Doe');
      expect(lastNameControl?.hasError('required')).toBeFalsy();
    });

    it('should validate lastName minimum length', () => {
      const lastNameControl = component.form.get('lastName');
      
      lastNameControl?.setValue('Do');
      expect(lastNameControl?.hasError('minlength')).toBeTruthy();
      
      lastNameControl?.setValue('Doe');
      expect(lastNameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate lastName maximum length', () => {
      const lastNameControl = component.form.get('lastName');
      const longName = 'a'.repeat(21);
      
      lastNameControl?.setValue(longName);
      expect(lastNameControl?.hasError('maxlength')).toBeTruthy();
      
      lastNameControl?.setValue('a'.repeat(20));
      expect(lastNameControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should validate password as required', () => {
      const passwordControl = component.form.get('password');
      
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('required')).toBeFalsy();
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.form.get('password');
      
      passwordControl?.setValue('ab');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
  
    });

    it('should validate password maximum length', () => {
      const passwordControl = component.form.get('password');
      const longPassword = 'a'.repeat(41);
      
      passwordControl?.setValue(longPassword);
      expect(passwordControl?.hasError('maxlength')).toBeTruthy();
      
      passwordControl?.setValue('a'.repeat(40));
      expect(passwordControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should have valid form with all correct fields', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Submit Method', () => {
    it('should call AuthService.register with form values', () => {
      const registerRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };
      component.form.setValue(registerRequest);
      
      authService.register.mockReturnValue(of(void 0));

      component.submit();

      expect(authService.register).toHaveBeenCalledWith(registerRequest);
    });

    it('should navigate to /login on successful registration', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      
      authService.register.mockReturnValue(of(void 0));

      component.submit();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set onError to true on registration failure', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      
      authService.register.mockReturnValue(
        throwError(() => new Error('Registration failed'))
      );

      component.submit();

      expect(component.onError).toBeTruthy();
    });

    it('should not set onError on successful registration', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      
      authService.register.mockReturnValue(of(void 0));

      component.submit();

      expect(component.onError).toBeFalsy();
    });
  });

  describe('Error Display', () => {
    it('should initialize with onError as false', () => {
      expect(component.onError).toBeFalsy();
    });

    it('should display error message when onError is true', () => {
      component.onError = true;
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error');

      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('An error occurred');
    });
  });

  describe('UI Interaction', () => {
    it('should disable submit button when form is invalid', () => {
      component.form.setValue({
        email: '',
        firstName: '',
        lastName: '',
        password: ''
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBeFalsy();
    });
  });
});