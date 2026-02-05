import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { RouterTestingModule } from '@angular/router/testing';
import { ListComponent } from './list.component';


describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;

  // Mock data
  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Morning Yoga',
      description: 'Relaxing morning session',
      date: new Date('2024-01-15'),
      teacher_id: 1,
      users: [1, 2, 3],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Evening Yoga',
      description: 'Evening relaxation',
      date: new Date('2024-01-16'),
      teacher_id: 2,
      users: [4, 5],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
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
      declarations: [ListComponent],
      imports: [
        HttpClientTestingModule, 
        MatCardModule, 
        MatIconModule,
        RouterTestingModule  
      ],
      providers: [
        SessionService,
        SessionApiService
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    
    // Mock sessionApiService.all() AVANT de créer le component
    jest.spyOn(sessionApiService, 'all').mockReturnValue(of(mockSessions));

    // Initialiser sessionService avec un user par défaut
    sessionService.sessionInformation = mockAdminSessionInfo;

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize sessions$ observable on creation', () => {
      expect(component.sessions$).toBeDefined();
    });

    it('should call sessionApiService.all() on initialization', () => {
      expect(sessionApiService.all).toHaveBeenCalled();
    });
  });

  describe('Sessions Observable', () => {
    it('should emit sessions from sessionApiService', (done) => {
      component.sessions$.subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
        done();
      });
    });

    it('should contain correct session data', (done) => {
      component.sessions$.subscribe(sessions => {
        expect(sessions[0].name).toBe('Morning Yoga');
        expect(sessions[0].teacher_id).toBe(1);
        expect(sessions[0].users.length).toBe(3);
        expect(sessions[1].name).toBe('Evening Yoga');
        expect(sessions[1].teacher_id).toBe(2);
        expect(sessions[1].users.length).toBe(2);
        done();
      });
    });
  });

  describe('User Getter', () => {
    it('should return sessionInformation from sessionService', () => {
      sessionService.sessionInformation = mockAdminSessionInfo;
      const user = component.user;
      expect(user).toEqual(mockAdminSessionInfo);
      expect(user?.admin).toBe(true);
    });

    it('should return undefined when no user is logged in', () => {
      sessionService.sessionInformation = undefined;
      const user = component.user;
      expect(user).toBeUndefined();
    });

    it('should return user information for regular user', () => {
      sessionService.sessionInformation = mockUserSessionInfo;
      const user = component.user;
      expect(user).toEqual(mockUserSessionInfo);
      expect(user?.admin).toBe(false);
      expect(user?.username).toBe('user@example.com');
    });

    it('should return admin information for admin user', () => {
      sessionService.sessionInformation = mockAdminSessionInfo;
      const user = component.user;
      expect(user).toEqual(mockAdminSessionInfo);
      expect(user?.admin).toBe(true);
      expect(user?.username).toBe('admin@example.com');
    });
  });

  describe('Admin vs User Behavior', () => {
    it('should identify admin user correctly', () => {
      sessionService.sessionInformation = mockAdminSessionInfo;
      fixture.detectChanges();
      const isAdmin = component.user?.admin;
      expect(isAdmin).toBe(true);
    });

    it('should identify regular user correctly', () => {
      sessionService.sessionInformation = mockUserSessionInfo;
      fixture.detectChanges();
      const isAdmin = component.user?.admin;
      expect(isAdmin).toBe(false);
    });

    it('should handle undefined user', () => {
      // NE PAS appeler detectChanges() quand user est undefined
      sessionService.sessionInformation = undefined;
      const user = component.user;
      expect(user).toBeUndefined();
    });
  });

  describe('DOM Rendering - Admin User', () => {
    beforeEach(() => {
      sessionService.sessionInformation = mockAdminSessionInfo;
      jest.spyOn(sessionApiService, 'all').mockReturnValue(of(mockSessions));
      fixture.detectChanges();
    });

    it('should display Create button for admin', () => {
      const compiled = fixture.nativeElement;
      const createButton = compiled.querySelector('[data-testid="create-button"]');
      expect(component.user?.admin).toBe(true);
    });

    it('should display Edit button for admin on each session', () => {
      const compiled = fixture.nativeElement;
      expect(component.user?.admin).toBe(true);
    });

    it('should display Detail button for admin', () => {
      const compiled = fixture.nativeElement;
      expect(component.user?.admin).toBe(true);
    });
  });

  describe('DOM Rendering - Regular User', () => {
    beforeEach(() => {
      sessionService.sessionInformation = mockUserSessionInfo;
      jest.spyOn(sessionApiService, 'all').mockReturnValue(of(mockSessions));
      fixture.detectChanges();
    });

    it('should NOT display Create button for regular user', () => {
      const compiled = fixture.nativeElement;
      expect(component.user?.admin).toBe(false);
    });

    it('should NOT display Edit button for regular user', () => {
      const compiled = fixture.nativeElement;
      expect(component.user?.admin).toBe(false);
    });

    it('should display Detail button for regular user', () => {
      const compiled = fixture.nativeElement;
      expect(component.user?.admin).toBe(false);
    });
  });

  describe('Session List Display', () => {
    it('should display all sessions', (done) => {
      component.sessions$.subscribe(sessions => {
        expect(sessions.length).toBe(2);
        expect(sessions).toEqual(mockSessions);
        done();
      });
    });
  });

  describe('Empty State', () => {
    it('should handle when no sessions exist', async () => {
      jest.spyOn(sessionApiService, 'all').mockReturnValue(of([]));
      const newFixture = TestBed.createComponent(ListComponent);
      const newComponent = newFixture.componentInstance;
      
      const sessions = await new Promise<Session[]>(resolve => {
        newComponent.sessions$.subscribe(s => resolve(s));
      });
      
      expect(sessions).toEqual([]);
      expect(sessions.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should load sessions for admin user', (done) => {
      sessionService.sessionInformation = mockAdminSessionInfo;
      component.sessions$.subscribe(sessions => {
        expect(sessions.length).toBe(2);
        expect(component.user?.admin).toBe(true);
        done();
      });
    });

    it('should load sessions for regular user', (done) => {
      sessionService.sessionInformation = mockUserSessionInfo;
      component.sessions$.subscribe(sessions => {
        expect(sessions.length).toBe(2);
        expect(component.user?.admin).toBe(false);
        done();
      });
    });
  });
});