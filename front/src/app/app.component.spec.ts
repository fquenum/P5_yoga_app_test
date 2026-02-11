import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './features/auth/services/auth.service';
import { SessionService } from './services/session.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionService: SessionService;
  let router: Router;

  const mockSessionInfo = {
    token: 'test-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MatToolbarModule
      ],
      declarations: [AppComponent],
      providers: [SessionService, AuthService]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('$isLogged Observable', () => {
    it('should return observable reflecting login state', (done) => {
      // Test logged out state
      sessionService.logOut();
      
      component.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        
        // Test logged in state
        sessionService.logIn(mockSessionInfo);
        
        component.$isLogged().subscribe(isLoggedAfter => {
          expect(isLoggedAfter).toBe(true);
          done();
        });
      });
    });
  });

  describe('logout Method', () => {
    it('should call sessionService.logOut and navigate to home', () => {
      // Arrange
      sessionService.logIn(mockSessionInfo);
      const logOutSpy = jest.spyOn(sessionService, 'logOut');

      // Act
      component.logout();

      // Assert
      expect(logOutSpy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('DOM Rendering', () => {
    it('should render toolbar and router-outlet', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
  });
});