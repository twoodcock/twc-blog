import React, { Component } from 'react';
import { TagWidget, CategoryWidget } from './Widgets';
import { Paginator } from './Paginator';
/*
 * This file contains post list components.
 *
 * PostList, Category, Tag
 */

class ComponentItemList extends Component {
  get heading() { return "" }
  render() {
    const listObj = this.listObj
    if (!listObj.posts) {
      return <div>Waiting for post list</div>
    }
    const posts = listObj.posts.map((thisPost)=>{
      const date = new Date(thisPost.date)
      return <div className="Post PostList-post" key={thisPost.url}>
          <h3>{thisPost.title}</h3>
          <div className="Post-summary">
          <div dangerouslySetInnerHTML={{__html: thisPost.summary}} />
          <a className="Post-read-the-rest"
            href={thisPost.urlFor()}
            onClick={this.props.getPost}
            data-year={date.getFullYear()}
            data-month={date.getMonth()+1}
            data-slug={thisPost.slug}>
              ...read the rest
          </a>
          </div>
          <div className="Post-meta">
            <div>Categories: <CategoryWidget categories={thisPost.categories} {...this.props}/></div>
            <div>Tags: <TagWidget tags={thisPost.tags} {...this.props}/></div>
            <div>Date: {date.toDateString()}</div>
          </div>
      </div>
    })
    return (<div className="PostList">
      <div className="PostList-heading">
      {this.heading && <h3>{this.heading}</h3>}
      {listObj.page_count > 1 && <Paginator
        slug={listObj.slug}
        page_count={listObj.page_count}
        page_number={listObj.page_number}
        first={listObj.firstItem}
        listObj={listObj}
        getPage={this.getPage} // getPage is defined in the subclass.
      />}
      </div>
      {posts}
    </div>);
  }
}

class PostList extends ComponentItemList {
  get heading() { return "All Posts" }
  get getPage() {
    return this.props.getPostList
  }
  get listObj() { return this.props.data.postList }
}
class TaggedPosts extends ComponentItemList {
  get heading() { return "Tag: " + this.props.data.tag.name }
  get getPage() {
    return this.props.getTag
  }
  get listObj() { return this.props.data.tag }
}
class CategoryPosts extends ComponentItemList {
  get heading() { return "Category: " + this.props.data.category.name }
  get getPage() {
    return this.props.getCategory
  }
  get listObj() { return this.props.data.category }
}

const PostListComponent = {
    PostList: PostList,
    TaggedPosts: TaggedPosts,
    CategoryPosts: CategoryPosts,
};
export default PostListComponent;