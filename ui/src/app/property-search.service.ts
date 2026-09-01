import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PropertyRecord } from './property.model';

@Injectable({ providedIn: 'root' })
export class PropertySearchService {
  private readonly http = inject(HttpClient);

  search(address: string): Observable<PropertyRecord> {
    return this.http.get<PropertyRecord>(`${environment.apiBaseUrl}/properties/search`, {
      params: { address },
    });
  }
}
