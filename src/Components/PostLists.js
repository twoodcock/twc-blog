import React, { Component } from 'react';
import { TagWidget, CategoryWidget } from './Widgets';
import { Paginator } from './Paginator';
/*
 * This file contains post list components.
 *
 * PostList, Category, Tag
 */

function LinkToPost(props) {
  return <a {...props}>{props.children}</a>
}
const tagSep = "\u00b7";
const categorySep = "/";

class ComponentItemList extends Component {
  get heading() { return "" }
  render() {
    const listObj = this.listObj
    if (!listObj.posts) {
      return <div>Waiting for post list</div>
    }
    const posts = listObj.posts.map((thisPost)=>{
      const date = new Date(thisPost.date)
      const linkProps = {
        href: thisPost.urlFor(),
        onClick: this.props.getPost,
        'data-year': date.getFullYear(),
        'data-month': date.getMonth()+1,
        'data-slug': thisPost.slug,
      }
      return <div className="Post PostList-post" key={thisPost.url}>
        <h3><LinkToPost className="Post-title" {...linkProps}>{thisPost.title}</LinkToPost></h3>
        <div className="Post-summary">
        <div dangerouslySetInnerHTML={{__html: thisPost.summary}} />
        <LinkToPost className="Post-read-the-rest" {...linkProps}>... read the rest</LinkToPost>
        </div>
        <div className="Post-meta">
          <div>Categories: <CategoryWidget separator={categorySep} categories={thisPost.categories} {...this.props}/></div>
          <div>Tags: <TagWidget separator={tagSep} tags={thisPost.tags} {...this.props}/></div>
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