import React, { Component } from 'react';

import { TagWidget, CategoryWidget } from './Widgets';
class TagList extends Component {
  render() {
    var maxCount = 0;
    if (this.props.tagList.length > 0) {
      maxCount = this.props.tagList.list.reduce((max, thisOne) => {
        if (thisOne.post_count > max) {
          return thisOne.post_count;
        }
        return max;
      }, 0);
    }
    return <div className="Tag-cloud">
      <h3>Tags</h3>
      { this.props.tagList.length && <TagWidget colorizeMax={maxCount} getTag={this.props.getTag} tags={this.props.tagList.list.filter(item => item.post_count > 2)} /> }
    </div>
  }
}

class CategoryTreeTL extends Component {
  render() {
    var categories = [];
    // get the top level categories.
    for (var key in this.props.categoryTree.tree) {
      categories.push(this.props.categoryTree.categories[key])
    }
    return <div className="Tag-cloud">
      <h3>Top Level Categories</h3>
      { this.props.categoryTree.categories && <CategoryWidget inline={true} getCategory={this.props.getCategory} categories={categories} /> }
    </div>
  }
}


const SidebarComponents = {
    TagList: TagList,
    CategoryTreeTL: CategoryTreeTL,
}
export default SidebarComponents;