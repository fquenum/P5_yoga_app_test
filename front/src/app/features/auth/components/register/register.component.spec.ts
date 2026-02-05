import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with empty fields', () => {
      expect(component.form.value).toEqual({
        email: '',
        firstName: '',
        lastName: '',
        password: ''
      });
    });

    it('should have all required form controls', () => {
      expect(component.form.contains('email')).toBeTruthy();
      expect(component.form.contains('firstName')).toBeTruthy();
      expect(component.form.contains('lastName')).toBeTruthy();
      expect(component.form.contains('password')).toBeTruthy();
    });

    it('should initialize onError as false', () => {
      expect(component.onError).toBe(false);
    });
  });

  describe('Email Field Validation', () => {
    it('should make email field required', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('should validate email format - invalid email', () => {
      const emailControl = component.form.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('test@');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('@example.com');
      expect(emailControl?.hasError('email')).toBeTruthy();
    });

    it('should validate email format - valid email', () => {
      const emailControl = component.form.get('email');
      
      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
      expect(emailControl?.valid).toBeTruthy();
    });
  });

  describe('FirstName Field Validation', () => {
    it('should make firstName field required', () => {
      const firstNameControl = component.form.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.hasError('required')).toBeTruthy();
    });

    it('should validate firstName minimum length', () => {
      const firstNameControl = component.form.get('firstName');
      
      firstNameControl?.setValue('ab'); // Less than 3
      expect(firstNameControl?.hasError('minlength')).toBeTruthy();
      
      firstNameControl?.setValue('abc'); // Exactly 3
      expect(firstNameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate firstName maximum length', () => {
      const firstNameControl = component.form.get('firstName');
      
      const longName = 'a'.repeat(21); // More than 20
      firstNameControl?.setValue(longName);
      expect(firstNameControl?.hasError('maxlength')).toBeTruthy();
      
      const validName = 'a'.repeat(20); // Exactly 20
      firstNameControl?.setValue(validName);
      expect(firstNameControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should accept valid firstName', () => {
      const firstNameControl = component.form.get('firstName');
      
      firstNameControl?.setValue('John');
      expect(firstNameControl?.valid).toBeTruthy();
      expect(firstNameControl?.errors).toBeNull();
    });
  });

  describe('LastName Field Validation', () => {
    it('should make lastName field required', () => {
      const lastNameControl = component.form.get('lastName');
      lastNameControl?.setValue('');
      expect(lastNameControl?.hasError('required')).toBeTruthy();
    });

    it('should validate lastName minimum length', () => {
      const lastNameControl = component.form.get('lastName');
      
      lastNameControl?.setValue('ab'); // Less than 3
      expect(lastNameControl?.hasError('minlength')).toBeTruthy();
      
      lastNameControl?.setValue('abc'); // Exactly 3
      expect(lastNameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate lastName maximum length', () => {
      const lastNameControl = component.form.get('lastName');
      
      const longName = 'a'.repeat(21); // More than 20
      lastNameControl?.setValue(longName);
      expect(lastNameControl?.hasError('maxlength')).toBeTruthy();
      
      const validName = 'a'.repeat(20); // Exactly 20
      lastNameControl?.setValue(validName);
      expect(lastNameControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should accept valid lastName', () => {
      const lastNameControl = component.form.get('lastName');
      
      lastNameControl?.setValue('Doe');
      expect(lastNameControl?.valid).toBeTruthy();
      expect(lastNameControl?.errors).toBeNull();
    });
  });

  describe('Password Field Validation', () => {
    it('should make password field required', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.form.get('password');
      
      passwordControl?.setValue('ab'); // Less than 3
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
      /*passwordControl?.setValue('abc'); // Exactly 3
      expect(passwordControl?.hasError('minlength')).toBeFalsy();*/
    });

    it('should validate password maximum length', () => {
      const passwordControl = component.form.get('password');
      
      const longPassword = 'a'.repeat(41); // More than 40
      passwordControl?.setValue(longPassword);
      expect(passwordControl?.hasError('maxlength')).toBeTruthy();
      
      const validPassword = 'a'.repeat(40); // Exactly 40
      passwordControl?.setValue(validPassword);
      expect(passwordControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should accept valid password', () => {
      const passwordControl = component.form.get('password');
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBeTruthy();
      expect(passwordControl?.errors).toBeNull();
    });
  });

  describe('Form Overall Validation', () => {
    it('should mark form as invalid when all fields are empty', () => {
      component.form.setValue({
        email: '',
        firstName: '',
        lastName: '',
        password: ''
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as invalid when email is missing', () => {
      component.form.setValue({
        email: '',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as invalid when firstName is missing', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: '',
        lastName: 'Doe',
        password: 'password123'
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as invalid when lastName is missing', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: '',
        password: 'password123'
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as invalid when password is missing', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: ''
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      expect(component.form.valid).toBeTruthy();
    });

    it('should mark form as invalid when email format is incorrect', () => {
      component.form.setValue({
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
      expect(component.form.valid).toBeFalsy();
    });

    it('should mark form as invalid when firstName is too short', () => {
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Jo', // Less than 3
        lastName: 'Doe',
        password: 'password123'
      });
      expect(component.form.valid).toBeFalsy();
    });
  });

  describe('Registration Functionality', () => {
    it('should call authService.register with form values on submit', () => {
      // Arrange
      const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      const routerSpy = jest.spyOn(router, 'navigate');

      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(registerSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });
    });

    it('should navigate to /login on successful registration', () => {
      // Arrange
      jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      const routerSpy = jest.spyOn(router, 'navigate');

      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(routerSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should set onError to true when registration fails', () => {
      // Arrange
      const error = { status: 400, message: 'Email already exists' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.form.setValue({
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(component.onError).toBe(true);
    });

    it('should not navigate to /login when registration fails', () => {
      // Arrange
      const error = { status: 400, message: 'Email already exists' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));
      const routerSpy = jest.spyOn(router, 'navigate');

      component.form.setValue({
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(routerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network error during registration', () => {
      // Arrange
      const error = { status: 0, message: 'Network error' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(component.onError).toBe(true);
    });

    it('should handle server error (500) during registration', () => {
      // Arrange
      const error = { status: 500, message: 'Internal server error' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      // Act
      component.submit();

      // Assert
      expect(component.onError).toBe(true);
    });

    it('should handle validation error (400) during registration', () => {
      // Arrange
      const error = { status: 400, message: 'Validation failed' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.form.setValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'ab' // Too short
      });

      // Act
      component.submit();

      // Assert
      expect(component.onError).toBe(true);
    });
  });

  describe('Integration - Form to Service', () => {
    it('should submit valid form data correctly', () => {
      // Arrange
      const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      jest.spyOn(router, 'navigate');

      // Act - Fill form with valid data
      component.form.patchValue({
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'securePassword123'
      });
      component.submit();

      // Assert
      expect(registerSpy).toHaveBeenCalledTimes(1);
      expect(registerSpy).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'securePassword123'
      });
    });

    it('should handle complete registration flow successfully', () => {
      // Arrange
      jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
      const routerSpy = jest.spyOn(router, 'navigate');
      
      // Initially no error
      expect(component.onError).toBe(false);

      // Act - Complete registration
      component.form.setValue({
        email: 'complete@example.com',
        firstName: 'Complete',
        lastName: 'User',
        password: 'password123'
      });
      component.submit();

      // Assert
      expect(component.onError).toBe(false);
      expect(routerSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should handle complete registration flow with error', () => {
      // Arrange
      const error = { status: 409, message: 'User already exists' };
      jest.spyOn(authService, 'register').mockReturnValue(throwError(() => error));
      const routerSpy = jest.spyOn(router, 'navigate');
      
      // Initially no error
      expect(component.onError).toBe(false);

      // Act - Try to register
      component.form.setValue({
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        password: 'password123'
      });
      component.submit();

      // Assert
      expect(component.onError).toBe(true);
      expect(routerSpy).not.toHaveBeenCalled();
    });
  });
});
