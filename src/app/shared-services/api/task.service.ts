import { Injectable } from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import List from "app/shared-classes/list";

@Injectable()
export class TaskService {
  public tasks = new List();
  constructor(private http: HttpService) { }

  async getList (branch_id) {
    let res = await this.http.get(`/task?branch_id=${branch_id}`).toPromise();
    if (res.error) throw res.error;
    this.tasks = new List(res.data);
    return this.tasks;
  }

  async get (task_id) {
    let res = await this.http.get(`/task/${task_id}`).toPromise();
    if (res.error) throw res.error;
    return res.data;
  }

  async create (task: FormData) {
    let res = await this.http.postForm("/task", task).toPromise();
    if (res.error) throw res.error;
    this.tasks.add(res.data);
    return res.data;
  }

  async update (task_id, task: FormData) {
    let res = await this.http.putForm(`/task/${task_id}`, task).toPromise();
    if (res.error) throw res.error;
    this.tasks.add(res.data);
    return res.data;
  }

  async delete (task_id) {
    let res = await this.http.delete(`/task/${task_id}`).toPromise();
    if (res.error) throw res.error;
    this.tasks.deleteId(task_id);
    return this.tasks;
  }


}
