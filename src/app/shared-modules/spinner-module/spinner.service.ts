import { Injectable } from '@angular/core';
import { SpinnerContainerComponent } from './spinner-container/spinner-container.component';

@Injectable()
export class SpinnerService {

  private spinnersName = new Map<string, SpinnerContainerComponent>();
  private spinnersGroup = new Map<string, Set<SpinnerContainerComponent>>();
  delay:number = 0;

  constructor() { }

  _register(spinner: SpinnerContainerComponent) {

    if (!spinner.name) throw Error('SpinnerComponent must have name');
    this.spinnersName.set(spinner.name, spinner);
    let group = spinner.group;
    
    if (group) {
      if (!this.spinnersGroup.get(group)) {
        this.spinnersGroup.set(group, new Set<SpinnerContainerComponent>());
      }
      
      this.spinnersGroup.get(group).add(spinner);
    }

  }

  _unregister(spinner: SpinnerContainerComponent) {
    this.spinnersName.delete(spinner.name);

    let group = spinner.group;
    let spinners = this.spinnersGroup.get(group);
    if (spinners) {
      spinners.delete(spinner);
    }
  }  

  // _changeSpinnerName(oldName: string, newName: string, spinner?:SpinnerContainerComponent) {
  //   this.spinnersName.delete(oldName);
  //   this.spinnersName.set(newName, spinner);
  // }

  // _changeSpinnerGroup(oldGroup: string, newGroup: string, spinner?: SpinnerContainerComponent) {
  //   let spinnersOldGroup = this.spinnersGroup.get(oldGroup);
  //   if (spinnersOldGroup) {
  //     spinnersOldGroup.delete(spinner);
  //   }

  //   let spinnersNewGroup = this.spinnersGroup.get(newGroup);
  //   if (!spinnersNewGroup) {
  //     this.spinnersGroup.set(newGroup, new Set<SpinnerContainerComponent>());
  //   }

  //   this.spinnersGroup.get(newGroup).add(spinner);
  // }

  show(name: string, isGroup = false) {    
    if (!isGroup) {
      let spinner = this.spinnersName.get(name);
      if (spinner) {
        spinner.show = true;
      }

      return;
    }

    let spinners = this.spinnersGroup.get(name);
    
    if (spinners && spinners.size) {
      spinners.forEach(spinner => spinner.show = true);
    }
  }

  hide(name: string, isGroup = false) {
    if (!isGroup) {
      let spinner = this.spinnersName.get(name);
      if (spinner) {
        spinner.show = false;
      }

      return;
    }

    let spinners = this.spinnersGroup.get(name);
    if (spinners && spinners.size) {
      spinners.forEach(spinner => spinner.show = false);
    }
  }

  showAll() {
    this.spinnersName.forEach(spinner => {
      spinner.show = true;
    });
  }

  hideAll() {
    this.spinnersName.forEach(spinner => {
      spinner.show = false;
    });
  }


}
