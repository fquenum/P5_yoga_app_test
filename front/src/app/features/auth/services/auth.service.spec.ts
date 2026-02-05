import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      // Arrange
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      // Act
      service.register(mockRegisterRequest).subscribe();

      // Assert
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      
      // Respond with empty response
      req.flush(null);
    });

    it('should return void on successful registration', (done) => {
      // Arrange
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      // Act
      service.register(mockRegisterRequest).subscribe({
        next: (response) => {
          // Assert
          expect(response).toBeNull();
          done();
        }
      });

      // Simulate server response
      const req = httpMock.expectOne('api/auth/register');
      req.flush(null);
    });

    it('should handle registration error', (done) => {
      // Arrange
      const mockRegisterRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };
      const errorMessage = 'Email already exists';

      // Act
      service.register(mockRegisterRequest).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simulate server error
      const req = httpMock.expectOne('api/auth/register');
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      // Arrange
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      service.login(mockLoginRequest).subscribe();

      // Assert
      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      
      // Clean up
      req.flush(null);
    });

    it('should return SessionInformation on successful login', (done) => {
      // Arrange
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockSessionInfo: SessionInformation = {
        token: 'jwt-token-123',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      // Act
      service.login(mockLoginRequest).subscribe({
        next: (response) => {
          // Assert
          expect(response).toEqual(mockSessionInfo);
          expect(response.token).toBe('jwt-token-123');
          expect(response.username).toBe('test@example.com');
          expect(response.admin).toBe(false);
          done();
        }
      });

      // Simulate server response
      const req = httpMock.expectOne('api/auth/login');
      req.flush(mockSessionInfo);
    });

    it('should handle login error with wrong credentials', (done) => {
      // Arrange
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const errorMessage = 'Invalid credentials';

      // Act
      service.login(mockLoginRequest).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simulate server error
      const req = httpMock.expectOne('api/auth/login');
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle server error during login', (done) => {
      // Arrange
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      service.login(mockLoginRequest).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simulate server error
      const req = httpMock.expectOne('api/auth/login');
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });
  });
});