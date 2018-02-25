import React, { Component } from 'react';
/*
 * Sidebar.js
 *
 * This module contains 2 widgets. These are exported in SidebarComponents,
 * the default, and only export.
 *
 *      SidebarComponents.TagList
 *      SidebarComponents.CategoryTreeFL
 *
 * # TagList:
 *
 * Taglist offers a tag cloud for the sidebar. Tags are colorized based on the
 * number of posts attached.
 *
 * # CategoryTreeFL
 *
 * The cateogry tree is a complex structure.
 * This widget shows the list of categories at the bottom level of the tree.
 */

import { TagWidget, CategoryWidget } from './Widgets';

function mostPosts(accumulator, aPost) {
  if (aPost.post_count > accumulator) {
    return aPost.post_count;
  }
  return accumulator;
}

class TagList extends Component {
  render() {
    var maxCount = 0;
    if (this.props.tagList.length > 0) {
      maxCount = this.props.tagList.list.reduce(mostPosts, 0);
    }
    return <div className="Tag-cloud">
      <h3>Tags</h3>
      { this.props.tagList.length && <TagWidget colorizeMax={maxCount} getTag={this.props.getTag} tags={this.props.tagList.list.filter(item => item.post_count > 2)} /> }
    </div>
  }
}

class CategoryTreeFL extends Component {
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
    CategoryTreeFL: CategoryTreeFL,
}
export default SidebarComponents;