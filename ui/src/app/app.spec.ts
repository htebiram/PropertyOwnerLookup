import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App search flow', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('clicking Search dispatches the expected request and shows loading', () => {
    enterAddress();
    button().click();
    fixture.detectChanges();

    const request = http.expectOne((r) => r.url.endsWith('/api/properties/search') && r.params.get('address') === sampleAddress);
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Searching');
    request.flush(sampleProperty);
  });

  it('hides health results until Check Health is clicked', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.health-result')).toBeNull();
    expect(healthButton().textContent).toContain('Check Health');
    http.expectNone((r) => r.url.endsWith('/api/health'));
  });

  it('checks health and renders a successful result', () => {
    healthButton().click();
    fixture.detectChanges();
    expect(healthButton().disabled).toBe(true);
    expect(healthButton().textContent).toContain('Checking...');

    http.expectOne((r) => r.url.endsWith('/api/health')).flush({ status: 'Healthy', service: 'PropertyOwnerLookup.Api' });
    fixture.detectChanges();
    const result = (fixture.nativeElement as HTMLElement).querySelector('.health-result');
    expect(result?.textContent).toContain('API is Healthy');
    expect(result?.textContent).toContain('PropertyOwnerLookup.Api');
    expect(healthButton().disabled).toBe(false);
  });

  it('shows a friendly health error without disabling search', () => {
    healthButton().click();
    http.expectOne((r) => r.url.endsWith('/api/health')).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.health-result.error')?.textContent).toContain('Unable to reach the backend API');
    expect(searchButton().disabled).toBe(false);
  });

  it('pressing Enter submits the same search', () => {
    enterAddress();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    http.expectOne((r) => r.params.get('address') === sampleAddress).flush(sampleProperty);
  });

  it('renders a successful sample result and resets loading', () => {
    submit();
    http.expectOne((r) => r.params.has('address')).flush(sampleProperty);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.result-card')?.textContent).toContain('SAMPLE OWNER');
    expect((fixture.nativeElement as HTMLElement).querySelector('.result-card')?.textContent).toContain('Just value');
    expect((fixture.nativeElement as HTMLElement).querySelector('.result-card')?.textContent).toContain('Year built');
    expect((fixture.nativeElement as HTMLElement).querySelector('.result-card')?.textContent).toContain('Latest sale');
    expect(button().disabled).toBe(false);
  });

  it('hides latest sale and absent optional characteristics', () => {
    submit();
    http.expectOne((r) => r.params.has('address')).flush({ ...sampleProperty,
      property: { ...sampleProperty.property, actualYearBuilt: null, livingArea: null, landSquareFeet: null }, sales: [] });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).querySelector('.result-card')?.textContent ?? '';
    expect(text).not.toContain('Latest sale'); expect(text).not.toContain('Year built');
  });

  it('does not call the API for blank input', () => {
    button().click();
    fixture.detectChanges();
    http.expectNone(() => true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.validation')?.textContent).toContain('Enter a property address');
  });

  it('shows the public-record not-found state for 404', () => {
    submit();
    http.expectOne((r) => r.params.has('address')).flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.state-card')?.textContent).toContain('No matching public property record');
  });

  it('shows the error state and resets loading for server errors', () => {
    submit();
    http.expectOne((r) => r.params.has('address')).flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.state-card.error')).toBeTruthy();
    expect(button().disabled).toBe(false);
  });

  const sampleAddress = '5318 Garden Hills Cir, West Palm Beach, FL 33415';
  const sampleProperty = {
    parcelNumber: 'SAMPLE-00', county: { number: '60', name: 'Palm Beach' },
    property: { address: '5318 Garden Hills Cir', city: 'West Palm Beach', state: 'FL', zipCode: '33415', dorUseCode: '001',
      actualYearBuilt: 2001, effectiveYearBuilt: 2005, livingArea: 1800, landSquareFeet: 6500 },
    owner: { name: 'SAMPLE OWNER', address1: '123 Sample St', address2: null, city: 'Orlando', state: 'FL', zipCode: '32801', mailingAddress: '123 Sample St, Orlando, FL 32801' },
    valuation: { justValue: 320000, assessedValueSchoolDistrict: 250000, assessedValueNonSchoolDistrict: 245000, landValue: 100000 },
    sales: [{ sequence: 1, salePrice: 200000, saleYear: 2020, saleMonth: 6, qualificationCode: '01', officialRecordBook: '1', officialRecordPage: '2' }],
    dataSource: { name: 'Sample local data', assessmentYear: null, isSampleData: true },
  };

  function input(): HTMLInputElement { return (fixture.nativeElement as HTMLElement).querySelector('input')!; }
  function healthButton(): HTMLButtonElement { return (fixture.nativeElement as HTMLElement).querySelector('.health-panel button')!; }
  function searchButton(): HTMLButtonElement { return (fixture.nativeElement as HTMLElement).querySelector('.search-panel button')!; }
  function button(): HTMLButtonElement { return searchButton(); }
  function enterAddress(): void { input().value = sampleAddress; input().dispatchEvent(new Event('input')); fixture.detectChanges(); }
  function submit(): void { enterAddress(); button().click(); fixture.detectChanges(); }
});
