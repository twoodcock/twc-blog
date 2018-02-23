import React from 'react';

function compareTags(a, b) {
  a = a.name.toUpperCase()
  b = b.name.toUpperCase()
  return (a<b)?-1:(a>b)?1:0;
}

export function CategoryWidget(props) {
  const categories = props.categories;
  if (!categories) {
    return <div>Did not get a categories list</div>;
  }
  const catCount = categories.length;
  var catNum = 0;
  if (props.inline) {
    return categories.sort(compareTags).map((category)=>{
      const showPostCount = props.showPostCount?" "+category.post_count:"";
      var name = category.name[0].toUpperCase() + category.name.substring(1);
      const target = category.urlFor();
      var title = "Category "+category.name;
      if (category.post_count) {
        title += ", " + category.post_count + " posts";
      }
      return <React.Fragment key={category.url}>
        <div className="Post-meta-inline Post-category"><a href={target} title={title} onClick={props.getCategory} data-target={target}>{name}{showPostCount}</a></div>
      </React.Fragment>
    })
  }
  return categories.map((category)=>{
    const showPostCount = props.showPostCount?" "+category.post_count:"";
    catNum++;
    const target = category.urlFor();
    var title = "Category "+category.name;
    if (category.post_count) {
      title += ", " + category.post_count + " posts";
    }
    return <React.Fragment key={category.url}>
      { catNum > 1 && catNum <= catCount && <span className="Post-separator">/</span>}
      <span><a href={target} title={ title } onClick={props.getCategory} data-target={target}>{category.shortname}{showPostCount}</a></span>
    </React.Fragment>
  })
}

export function TagWidget(props) {
  const tags = props.tags;
  if (!tags) {
    return <div>Did not get a tags list.</div>;
  }
  return tags.sort(compareTags).map((tag)=>{
    var classes = ['Post-meta-inline', 'Post-tag'];
    const showPostCount = props.showPostCount?" "+tag.post_count:"";
    if (props.colorizeMax) {
      // map this tag's post_count to the nearest 10%
      const mapped = Math.round(tag.post_count *10/props.colorizeMax)*10;
      classes.push("Tag-"+mapped)
    }
    var title = "Tag "+tag.name;
    if (tag.post_count) {
      title += ", " + tag.post_count + " posts";
    }
    var name = tag.name[0].toUpperCase() + tag.name.substring(1);
    const target = tag.urlFor();
    return <React.Fragment key={tag.url}>
      <div className={ classes.join(" ") }><a href={target} title={title} onClick={props.getTag} data-target={target}>{name}{showPostCount}</a></div>
    </React.Fragment>
  })
}
export function AuthorWidget(props) {
  return props.post.authors.map((author)=>{
    return <React.Fragment key={author.url}>
      <div className="Post-meta-inline Post-meta-author"><a href={"#"+author.slug} onClick={props.getAuthor} data-url={author.url}>{author.name}</a></div>
    </React.Fragment>
  });
}