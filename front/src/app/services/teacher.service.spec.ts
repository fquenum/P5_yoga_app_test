import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Teacher } from '../interfaces/teacher.interface';

import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifier qu'il n'y a pas de requêtes HTTP en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should return an Observable<Teacher[]>', (done) => {
      // Arrange - Données mockées
      const mockTeachers: Teacher[] = [
        {
          id: 1,
          lastName: 'Doe',
          firstName: 'John',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          lastName: 'Smith',
          firstName: 'Jane',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Act
      service.all().subscribe({
        next: (teachers) => {
          // Assert
          expect(teachers).toEqual(mockTeachers);
          expect(teachers.length).toBe(2);
          expect(teachers[0].firstName).toBe('John');
          expect(teachers[1].firstName).toBe('Jane');
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should handle empty teacher list', (done) => {
      // Arrange
      const emptyTeachers: Teacher[] = [];

      // Act
      service.all().subscribe({
        next: (teachers) => {
          // Assert
          expect(teachers).toEqual([]);
          expect(teachers.length).toBe(0);
          done();
        }
      });

      // Simuler réponse vide
      const req = httpMock.expectOne('api/teacher');
      req.flush(emptyTeachers);
    });

    it('should handle HTTP error when fetching all teachers', (done) => {
      // Arrange
      const errorMessage = 'Server error';

      // Act
      service.all().subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler une erreur serveur
      const req = httpMock.expectOne('api/teacher');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('detail', () => {
    it('should return a teacher by id', (done) => {
      // Arrange
      const teacherId = '1';
      const mockTeacher: Teacher = {
        id: 1,
        lastName: 'Doe',
        firstName: 'John',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      // Act
      service.detail(teacherId).subscribe({
        next: (teacher) => {
          // Assert
          expect(teacher).toEqual(mockTeacher);
          expect(teacher.id).toBe(1);
          expect(teacher.firstName).toBe('John');
          expect(teacher.lastName).toBe('Doe');
          done();
        }
      });

      // Simuler la réponse HTTP
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should construct correct URL with teacher id', () => {
      // Arrange
      const teacherId = '42';
      const mockTeacher: Teacher = {
        id: 42,
        lastName: 'Test',
        firstName: 'Teacher',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Act
      service.detail(teacherId).subscribe();

      // Assert - Vérifier l'URL
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.url).toBe(`api/teacher/${teacherId}`);
      req.flush(mockTeacher);
    });

    it('should handle 404 error when teacher not found', (done) => {
      // Arrange
      const teacherId = '999';
      const errorMessage = 'Teacher not found';

      // Act
      service.detail(teacherId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      // Simuler une erreur 404
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error when fetching teacher detail', (done) => {
      // Arrange
      const teacherId = '1';
      const errorMessage = 'Internal server error';

      // Act
      service.detail(teacherId).subscribe({
        error: (error) => {
          // Assert
          expect(error.status).toBe(500);
          done();
        }
      });

      // Simuler une erreur serveur
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });
});