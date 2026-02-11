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
import { SessionService } from 'src/app/services/session.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let sessionService: any;
  let router: Router;

  beforeEach(async () => {
    // Créer les mocks
    authService = {
      login: jest.fn()
    };

    sessionService = {
      logIn: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
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
        { provide: AuthService, useValue: authService },
        { provide: SessionService, useValue: sessionService }
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    
    
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    
    fixture = TestBed.createComponent(LoginComponent);
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
      
      passwordControl?.setValue('abc');
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });

    it('should have valid form with correct email and password', () => {
      component.form.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Submit Method', () => {
    it('should call AuthService.login with form values', () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };
      component.form.setValue(loginRequest);
      
      const mockResponse: SessionInformation = {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };
      
      authService.login.mockReturnValue(of(mockResponse));

      component.submit();

      expect(authService.login).toHaveBeenCalledWith(loginRequest);
    });

    it('should call SessionService.logIn on successful login', () => {
      component.form.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const mockResponse: SessionInformation = {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };
      
      authService.login.mockReturnValue(of(mockResponse));

      component.submit();

      expect(sessionService.logIn).toHaveBeenCalledWith(mockResponse);
    });

    it('should navigate to /sessions on successful login', () => {
      component.form.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const mockResponse: SessionInformation = {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };
      
      authService.login.mockReturnValue(of(mockResponse));

      component.submit();

      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should set onError to true on login failure', () => {
      component.form.setValue({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
      
      authService.login.mockReturnValue(
        throwError(() => new Error('Login failed'))
      );

      component.submit();

      expect(component.onError).toBeTruthy();
    });

    it('should not set onError on successful login', () => {
      component.form.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const mockResponse: SessionInformation = {
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };
      
      authService.login.mockReturnValue(of(mockResponse));

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
        password: ''
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.form.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(submitButton.disabled).toBeFalsy();
    });
  });
});