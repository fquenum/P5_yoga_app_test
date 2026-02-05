import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { FormComponent } from './form.component';



describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let sessionService: SessionService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  // Mock data
  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'Morning yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockTeachers = [
    { id: 1, lastName: 'Doe', firstName: 'John', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, lastName: 'Smith', firstName: 'Jane', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockAdminSessionInfo = {
    token: 'admin-token',
    type: 'Bearer',
    id: 1,
    username: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true
  };

  const mockUserSessionInfo = {
    token: 'user-token',
    type: 'Bearer',
    id: 2,
    username: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    admin: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [
        SessionService,
        SessionApiService,
        TeacherService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn()
              }
            }
          }
        }
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);

    // Mock teachers service
    jest.spyOn(teacherService, 'all').mockReturnValue(of(mockTeachers));

    // Set admin session by default
    sessionService.sessionInformation = mockAdminSessionInfo;
  });

  it('should create', () => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  describe('ngOnInit - Access Control', () => {
    it('should redirect non-admin users to sessions list', () => {
      // Arrange
      sessionService.sessionInformation = mockUserSessionInfo;
      const navigateSpy = jest.spyOn(router, 'navigate');

      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
    });

    it('should allow admin users to access the form', () => {
      // Arrange
      sessionService.sessionInformation = mockAdminSessionInfo;
      const navigateSpy = jest.spyOn(router, 'navigate');
      jest.spyOn(router, 'url', 'get').mockReturnValue('/create');

      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(navigateSpy).not.toHaveBeenCalledWith(['/sessions']);
    });
  });

  describe('ngOnInit - Create Mode', () => {
    beforeEach(() => {
      jest.spyOn(router, 'url', 'get').mockReturnValue('/create');
    });

    it('should set onUpdate to false in create mode', () => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(component.onUpdate).toBe(false);
    });

    it('should initialize empty form in create mode', () => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.value).toEqual({
        name: '',
        date: '',
        teacher_id: '',
        description: ''
      });
    });

    it('should have all required form controls in create mode', () => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(component.sessionForm?.contains('name')).toBeTruthy();
      expect(component.sessionForm?.contains('date')).toBeTruthy();
      expect(component.sessionForm?.contains('teacher_id')).toBeTruthy();
      expect(component.sessionForm?.contains('description')).toBeTruthy();
    });
  });

  describe('ngOnInit - Update Mode', () => {
    beforeEach(() => {
      jest.spyOn(router, 'url', 'get').mockReturnValue('/update/1');
      const activatedRoute = TestBed.inject(ActivatedRoute);
      jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
    });

    it('should set onUpdate to true in update mode', () => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(component.onUpdate).toBe(true);
    });

    it('should fetch session details in update mode', () => {
      // Arrange
      const detailSpy = jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));

      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      expect(detailSpy).toHaveBeenCalledWith('1');
    });

    it('should initialize form with session data in update mode', (done) => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Assert
      setTimeout(() => {
        expect(component.sessionForm?.value.name).toBe('Yoga Session');
        expect(component.sessionForm?.value.description).toBe('Morning yoga session');
        expect(component.sessionForm?.value.teacher_id).toBe(1);
        done();
      }, 100);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      jest.spyOn(router, 'url', 'get').mockReturnValue('/create');
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
    });

    it('should require name field', () => {
      const nameControl = component.sessionForm?.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();
    });

    it('should require date field', () => {
      const dateControl = component.sessionForm?.get('date');
      dateControl?.setValue('');
      expect(dateControl?.hasError('required')).toBeTruthy();
    });

    it('should require teacher_id field', () => {
      const teacherControl = component.sessionForm?.get('teacher_id');
      teacherControl?.setValue('');
      expect(teacherControl?.hasError('required')).toBeTruthy();
    });

    it('should require description field', () => {
      const descControl = component.sessionForm?.get('description');
      descControl?.setValue('');
      expect(descControl?.hasError('required')).toBeTruthy();
    });

    it('should validate description max length (2000)', () => {
      const descControl = component.sessionForm?.get('description');
      const longDescription = 'a'.repeat(2001);
      
      descControl?.setValue(longDescription);
      expect(descControl?.hasError('maxlength')).toBeTruthy();
      
      descControl?.setValue('a'.repeat(2000));
      expect(descControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should mark form as invalid when fields are empty', () => {
      component.sessionForm?.setValue({
        name: '',
        date: '',
        teacher_id: '',
        description: ''
      });
      
      expect(component.sessionForm?.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      component.sessionForm?.setValue({
        name: 'Test Session',
        date: '2024-01-15',
        teacher_id: 1,
        description: 'Test description'
      });
      
      expect(component.sessionForm?.valid).toBeTruthy();
    });
  });

  describe('Submit - Create Mode', () => {
    beforeEach(() => {
      jest.spyOn(router, 'url', 'get').mockReturnValue('/create');
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
    });

    it('should call sessionApiService.create with form values', () => {
      // Arrange
      const createSpy = jest.spyOn(sessionApiService, 'create').mockReturnValue(of(mockSession));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.sessionForm?.setValue({
        name: 'New Session',
        date: '2024-01-20',
        teacher_id: 1,
        description: 'New session description'
      });

      // Act
      component.submit();

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        name: 'New Session',
        date: '2024-01-20',
        teacher_id: 1,
        description: 'New session description'
      });
    });

    it('should show success message after creating session', () => {
      // Arrange
      jest.spyOn(sessionApiService, 'create').mockReturnValue(of(mockSession));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');

      component.sessionForm?.setValue({
        name: 'New Session',
        date: '2024-01-20',
        teacher_id: 1,
        description: 'New session description'
      });

      // Act
      component.submit();

      // Assert
      expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    });

    it('should navigate to sessions list after creating session', () => {
      // Arrange
      jest.spyOn(sessionApiService, 'create').mockReturnValue(of(mockSession));
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.sessionForm?.setValue({
        name: 'New Session',
        date: '2024-01-20',
        teacher_id: 1,
        description: 'New session description'
      });

      // Act
      component.submit();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('Submit - Update Mode', () => {
    beforeEach(() => {
      jest.spyOn(router, 'url', 'get').mockReturnValue('/update/1');
      const activatedRoute = TestBed.inject(ActivatedRoute);
      jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
      
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
    });

    it('should call sessionApiService.update with session id and form values', (done) => {
      // Arrange
      const updateSpy = jest.spyOn(sessionApiService, 'update').mockReturnValue(of(mockSession));
      jest.spyOn(matSnackBar, 'open');
      jest.spyOn(router, 'navigate');

      setTimeout(() => {
        component.sessionForm?.patchValue({
          name: 'Updated Session',
          description: 'Updated description'
        });

        // Act
        component.submit();

        // Assert
        expect(updateSpy).toHaveBeenCalledWith('1', expect.objectContaining({
          name: 'Updated Session',
          description: 'Updated description'
        }));
        done();
      }, 100);
    });

    it('should show success message after updating session', (done) => {
      // Arrange
      jest.spyOn(sessionApiService, 'update').mockReturnValue(of(mockSession));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');

      setTimeout(() => {
        // Act
        component.submit();

        // Assert
        expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
        done();
      }, 100);
    });

    it('should navigate to sessions list after updating session', (done) => {
      // Arrange
      jest.spyOn(sessionApiService, 'update').mockReturnValue(of(mockSession));
      const navigateSpy = jest.spyOn(router, 'navigate');

      setTimeout(() => {
        // Act
        component.submit();

        // Assert
        expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });
  });

  describe('Teachers Observable', () => {
    it('should load teachers on initialization', () => {
      // Arrange
      const teachersSpy = jest.spyOn(teacherService, 'all').mockReturnValue(of(mockTeachers));

      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;

      // Assert
      expect(component.teachers$).toBeDefined();
    });

    it('should emit teachers list', (done) => {
      // Act
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;

      // Assert
      component.teachers$.subscribe(teachers => {
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
        done();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete create flow', () => {
      // Arrange
      jest.spyOn(router, 'url', 'get').mockReturnValue('/create');
      const createSpy = jest.spyOn(sessionApiService, 'create').mockReturnValue(of(mockSession));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const navigateSpy = jest.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Act
      component.sessionForm?.setValue({
        name: 'Integration Test Session',
        date: '2024-02-01',
        teacher_id: 2,
        description: 'Integration test description'
      });
      component.submit();

      // Assert
      expect(createSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });

    it('should handle complete update flow', (done) => {
      // Arrange
      jest.spyOn(router, 'url', 'get').mockReturnValue('/update/1');
      const activatedRoute = TestBed.inject(ActivatedRoute);
      jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
      const updateSpy = jest.spyOn(sessionApiService, 'update').mockReturnValue(of(mockSession));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');
      const navigateSpy = jest.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      component.ngOnInit();

      // Act
      setTimeout(() => {
        component.sessionForm?.patchValue({ name: 'Updated in Integration Test' });
        component.submit();

        // Assert
        expect(updateSpy).toHaveBeenCalledWith('1', expect.any(Object));
        expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
        expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });
  });
});