import React from 'react';
import { TagWidget, CategoryWidget } from './Widgets';

// FIXME: These should go somewhere.
const tagSep = "\u00b7";
const categorySep = "/";

export class PostComponent extends React.Component {
  render() {
    const thisPost = this.props.data.post;
    const date = new Date(thisPost.date)
    return (<div className="Post">
      <h3>{thisPost.title}</h3>
      <div className="Post-meta">
        <div>Categories: <CategoryWidget separator={categorySep} categories={thisPost.categories} {...this.props}/></div>
        <div>Tags: <TagWidget separator={tagSep} tags={thisPost.tags} {...this.props}/></div>
        <div>Date: {date.toDateString()}</div>
      </div>
      <div className="Post-content" dangerouslySetInnerHTML={{__html: thisPost.content}} />
    </div>);
  }
}

export class PageComponent extends React.Component {
  render() {
    const thisPage = this.props.data.page;
    var cssId = thisPage.cssid;
    if (!cssId) {
      cssId = "Page";
    }
    return (<div id={cssId} className="Page">
      <h3>{thisPage.title}</h3>
      <div className="Page-content" dangerouslySetInnerHTML={{__html: thisPage.content}} />
    </div>);
  }
}