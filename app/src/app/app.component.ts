import { Component } from '@angular/core';
import { SpinnerService } from './shared/services/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'OptiCash';
  loading : boolean = true;
  constructor(
    private spinner:SpinnerService,
  ){

  }

  ngOnInit(){
    setTimeout(() => {
      this.spinner.returnSpinnerObservable().subscribe( value => {
          this.loading = value;
      });
    }, 100);
    
  }

  ngAfterViewInit(): void {
    
  }
}
