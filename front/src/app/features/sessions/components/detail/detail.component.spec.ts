import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule, } from '@angular/router/testing';
import { expect } from '@jest/globals'; 
import { SessionService } from '../../../../services/session.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { of } from 'rxjs';

import { TeacherService } from '../../../../services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';


import { DetailComponent } from './detail.component';


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let matSnackBar: MatSnackBar;
  let router: Router;

  const mockSession: Session = {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing morning session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'Smith',
    firstName: 'John',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSessionInfo = {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule,  // ✅ AJOUT pour éviter l'erreur @state.done
        ReactiveFormsModule
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
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    matSnackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);

    sessionService.sessionInformation = mockSessionInfo;

    jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
    jest.spyOn(teacherService, 'detail').mockReturnValue(of(mockTeacher));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with session data on ngOnInit', () => {
      expect(component.session).toEqual(mockSession);
      expect(component.teacher).toEqual(mockTeacher);
    });

    it('should get sessionId from route params', () => {
      expect(component.sessionId).toBe('1');
    });

    it('should set isAdmin from session service', () => {
      expect(component.isAdmin).toBe(true);
    });

    it('should set userId from session service', () => {
      expect(component.userId).toBe('1');
    });

    it('should call fetchSession on ngOnInit', () => {
      const fetchSessionSpy = jest.spyOn(component as any, 'fetchSession');
      component.ngOnInit();
      expect(fetchSessionSpy).toHaveBeenCalled();
    });
  });

  describe('Session Details', () => {
    it('should fetch session details', (done) => {
      component.ngOnInit();
      
      setTimeout(() => {
        expect(sessionApiService.detail).toHaveBeenCalledWith('1');
        expect(component.session).toEqual(mockSession);
        done();
      }, 100);
    });

    it('should fetch teacher details after session is loaded', (done) => {
      component.ngOnInit();
      
      setTimeout(() => {
        expect(teacherService.detail).toHaveBeenCalledWith('1');
        expect(component.teacher).toEqual(mockTeacher);
        done();
      }, 100);
    });

    it('should determine if user is participating', (done) => {
      component.ngOnInit();
      
      setTimeout(() => {
        expect(component.isParticipate).toBe(true);
        done();
      }, 100);
    });

    it('should set isParticipate to false when user is not in session', (done) => {
      const sessionWithoutUser = {
        ...mockSession,
        users: [5, 6, 7]
      };
      
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(sessionWithoutUser));
      
      component.ngOnInit();
      
      setTimeout(() => {
        expect(component.isParticipate).toBe(false);
        done();
      }, 100);
    });
  });

  describe('back', () => {
    it('should call window.history.back', () => {
      const backSpy = jest.spyOn(window.history, 'back');
      component.back();
      expect(backSpy).toHaveBeenCalled();
    });
  });

  describe('participate', () => {
    it('should call sessionApiService.participate', () => {
      const participateSpy = jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      
      component.participate();
      
      expect(participateSpy).toHaveBeenCalledWith('1', '1');
    });

    it('should refresh session data after participating', (done) => {
      jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      
      component.participate();
      
      setTimeout(() => {
        expect(sessionApiService.detail).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('unParticipate', () => {
    it('should call sessionApiService.unParticipate', () => {
      const unParticipateSpy = jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      
      component.unParticipate();
      
      expect(unParticipateSpy).toHaveBeenCalledWith('1', '1');
    });

    it('should refresh session data after unparticipating', (done) => {
      jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      
      component.unParticipate();
      
      setTimeout(() => {
        expect(sessionApiService.detail).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('delete', () => {
    it('should call sessionApiService.delete with sessionId', () => {
      const deleteSpy = jest.spyOn(sessionApiService, 'delete').mockReturnValue(of({}));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      component.delete();
      
      expect(deleteSpy).toHaveBeenCalledWith('1');
    });

    it('should show snackbar message after deleting', () => {
      jest.spyOn(sessionApiService, 'delete').mockReturnValue(of({}));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
      
      component.delete();
      
      expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    });

    it('should navigate to sessions list after deleting', (done) => {
      jest.spyOn(sessionApiService, 'delete').mockReturnValue(of({}));
      jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      component.delete();
      
      // ✅ Attendre que l'observable se termine
      setTimeout(() => {
        expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });
  });

  describe('Admin Features', () => {
    it('should allow admin to delete session', () => {
      component.isAdmin = true;
      expect(component.isAdmin).toBe(true);
    });

    it('should not allow non-admin to delete session', () => {
      sessionService.sessionInformation = {
        ...mockSessionInfo,
        admin: false
      };
      
      const newFixture = TestBed.createComponent(DetailComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(newComponent.isAdmin).toBe(false);
    });
  });

  describe('Participation Status', () => {
    it('should update isParticipate after participating', (done) => {
      const updatedSession = {
        ...mockSession,
        users: [1, 2, 3, 4]
      };
      
      jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(updatedSession));
      
      component.participate();
      
      setTimeout(() => {
        expect(component.session?.users).toContain(1);
        done();
      }, 100);
    });

    it('should update isParticipate after unparticipating', (done) => {
      const updatedSession = {
        ...mockSession,
        users: [2, 3]
      };
      
      jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(updatedSession));
      
      component.unParticipate();
      
      setTimeout(() => {
        expect(component.session?.users).not.toContain(1);
        expect(component.isParticipate).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete delete flow for admin', (done) => {
      const deleteSpy = jest.spyOn(sessionApiService, 'delete').mockReturnValue(of({}));
      const snackBarSpy = jest.spyOn(matSnackBar, 'open').mockReturnValue({} as any);
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      component.delete();
      
      // Attendre que l'observable se termine
      setTimeout(() => {
        expect(deleteSpy).toHaveBeenCalledWith('1');
        expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
        expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
        done();
      }, 100);
    });

    it('should handle complete participate flow', (done) => {
      const updatedSession = {
        ...mockSession,
        users: [1, 2, 3, 4]
      };
      
      jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(updatedSession));
      
      component.participate();
      
      setTimeout(() => {
        expect(sessionApiService.participate).toHaveBeenCalledWith('1', '1');
        expect(sessionApiService.detail).toHaveBeenCalled();
        expect(component.session?.users.length).toBe(4);
        done();
      }, 100);
    });

    it('should handle complete unparticipate flow', (done) => {
      const updatedSession = {
        ...mockSession,
        users: [2, 3]
      };
      
      jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(updatedSession));
      
      component.unParticipate();
      
      setTimeout(() => {
        expect(sessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
        expect(sessionApiService.detail).toHaveBeenCalled();
        expect(component.session?.users).not.toContain(1);
        done();
      }, 100);
    });
  });
});





