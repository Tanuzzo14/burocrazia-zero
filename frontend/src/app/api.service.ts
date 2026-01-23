import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OperationIdentification {
  operation: string;
  stateCost: number;
  commission: number;
  totalCost: number;
  guideUrl: string;
}

export interface BookingRequest {
  nome_cognome: string;
  telefono: string;
  tipo_operazione: string;
  totale_incassato: number;
  guida_url: string;
}

export interface BookingResponse {
  leadId: string;
  paymentUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8787/api'; // Update for production

  constructor(private http: HttpClient) {}

  identifyOperation(query: string): Observable<OperationIdentification> {
    return this.http.post<OperationIdentification>(`${this.apiUrl}/identify`, { query });
  }

  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/book`, booking);
  }
}
