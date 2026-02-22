import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type NodeRow = { id: string; label: string; parent: string | null };

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

@Injectable({ providedIn: 'root' })
export class D3TreeService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  getNodesFromPosts(limit: number): Observable<NodeRow[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      map((posts) => posts.slice(0, limit)),
      map((posts) =>
        posts.map((p, index) => ({
          id: String(p.id),
          label: p.title, // show title in box
          parent: index === 0 ? null : String(posts[index - 1].id),
        }))
      )
    );
  }
}