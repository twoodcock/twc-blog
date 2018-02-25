import React from 'react';
/*
 * Widget.js - implement category and tag widgets.
 * 
 * Contains CategoryWidget and TagWidget.
 *
 * Used by Sidebar.js and PostLists.js
 * 
 */

function compareTags(a, b) {
  a = a.name.toUpperCase()
  b = b.name.toUpperCase()
  return (a<b)?-1:(a>b)?1:0;
}

/*
 * <CategoryWidget
 *    categories={categoryList}
 */
export function CategoryWidget(props) {
  const categories = props.categories;
  if (!categories) {
    return <div>Did not get a categories list</div>;
  }
  const numEntries = categories.length;
  var count = 0;
  return categories.sort(compareTags).map((category)=>{
    count++;
    return <PostListItemWidget
      key={category.url}
      colorizeMax={props.colorizeMax}
      separator={props.separator}
      onClick={props.getCategory}
      item={category}
      name={category.shortname}
      count={count}
      numEntries={numEntries}
      titlePrefix="Category"
      className="Post-category"
    />
  })
}

export function TagWidget(props) {
  const tags = props.tags;
  if (!tags) {
    return <div>Did not get a tags list.</div>;
  }
  const numEntries = tags.length;
  var count = 0;
  return tags.sort(compareTags).map((tag)=>{
    count++;
    return <PostListItemWidget
      key={tag.url}
      colorizeMax={props.colorizeMax}
      separator={props.separator}
      onClick={props.getTag}
      item={tag}
      name={tag.name}
      count={count}
      numEntries={numEntries}
      titlePrefix="Tag"
      className="Post-tag"
    />
  })
}

export function PostListItemWidget(props) {
  var classes = ['Post-meta-inline', props.className];
  if (props.colorizeMax) {
    // map this tag's post_count to the nearest 10% of the maximum number of
    // posts in all tags.
    const mapped = Math.round(props.item.post_count *10/props.colorizeMax)*10;
    // the class doesn't change whether category or tag; simpler css that way.
    classes.push("Tag-"+mapped)
  }
  const name = props.name[0].toUpperCase() + props.name.substring(1);
  var title = props.titlePrefix + " " + name
  if (props.item.post_count) {
    title += ", " + props.item.post_count + " posts";
  }
  const target = props.item.urlFor();
  return <React.Fragment>
    { props.separator && props.count > 1 && props.count <= props.numEntries && <span className="Post-separator">{ props.separator }</span>}
    <div className={ classes.join(" ") }><a href={target} title={title} onClick={props.onClick} data-target={target}>{name}</a></div>
  </React.Fragment>
}