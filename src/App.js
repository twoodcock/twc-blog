import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { APIPostList, APIPost, APICategory, APITag } from './BlogAPI/APIObjects';

function PageLink(props) {
  var content;
  if (props.page) {
    content = (<a onClick={props.getPage} data-slug={props.slug} data-page={props.page}>{props.children}</a>);
    console.log("PageLink with ", props)
  } else {
    content = props.children;
  }
  return (<div className={props.className}>{content}</div>);
}

class Pagintator extends Component {
  firstChar = '\u21E4';
  previousChar = '\u21E0';
  nextChar = '\u21E2';
  lastChar = '\u21E5';
  moreChar = '\u2026';
  radius = 3;
  render() {
    // render these things:
    // <- [1] 2 3 4 ... 22 ->
    // <- 1 [2] 3 4 5 ... 22 ->
    // <- 1 ... 4 5 6 [7] 8 9 10 ... 22 ->
    // <- 1 ... 18 19 20 [21] 22 ->
    // <- 1 ... 19 20 21 [22] ->
    var rangeStart = this.props.page_number - this.radius;
    var rangeEnd = this.props.page_number + this.radius;
    var previousPage;
    var nextPage;
    if (this.props.page_number !== 1) {
      previousPage = this.props.page_number - 1;
    }
    if (this.props.page_number !== this.props.page_count) {
      nextPage = this.props.page_number + 1;
    }

    if (rangeStart < 1) {
      rangeStart = 1;
    }
    if (rangeEnd > this.props.page_count) {
      rangeEnd = this.props.page_count;
    }

    var range = []
    for (var i=rangeStart; i <= rangeEnd; i++) {
      const content = (i === this.props.page_number)?"["+i+"]":i;
      range.push(<PageLink {...this.props} key={i} id={"page-"+i} page={i}>{content}</PageLink>)
    }
    return (<div className="PostList-pagination">
      <PageLink {...this.props} className="PostList-previous" page={previousPage}>{this.previousChar}</PageLink>
      <span className="PostList-range">
        {rangeStart !== 1 && <PageLink {...this.props} className="PostList-first" page={1}>1</PageLink>}
        {rangeStart > 2 && this.moreChar}
        {range}
        {rangeEnd !== this.props.page_count && this.moreChar}
        {rangeEnd !== this.props.page_count && <PageLink {...this.props} className="PostList-last" page={this.props.page_count}>{this.props.page_count}</PageLink>}
        </span>
      <PageLink {...this.props} className="PostList-next" page={nextPage}>{this.nextChar}</PageLink>
    </div>);
  }
}
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
          <div className="Comp-summary">
          <div dangerouslySetInnerHTML={{__html: thisPost.summary}} />
          <a className="Comp-read-the-rest"
            onClick={this.props.getPost}
            data-year={date.getFullYear()}
            data-month={date.getMonth()+1}
            data-slug={thisPost.slug}>
              ...read the rest
          </a>
          </div>
          <div className="Comp-meta">
            <div>Categories: <CategoryWidget post={thisPost} {...this.props}/></div>
            <div>Tags: <TagWidget post={thisPost} {...this.props}/></div>
            <div>Date: {date.toDateString()}</div>
          </div>
      </div>
    })
    console.log("building post list", listObj)
    return (<div className="Comp">
      <div className="PostList-heading">
      {this.heading && <h3>{this.heading}</h3>}
      {listObj.page_count > 1 && <Pagintator
        slug={listObj.slug}
        page_count={listObj.page_count}
        page_number={listObj.page_number}
        first={listObj.firstItem}
        getPage={this.getPage} // getPage is defined in the subclass.
      />}
      </div>
      {posts}
    </div>);
  }
}

function CategoryWidget(props) {
  const thisPost = props.post;
  const catCount = props.post.categories.length;
  var catNum = 0;
  return props.post.categories.map((cat)=>{
    catNum++;
    return <React.Fragment key={cat.url}>
      { catNum > 1 && catNum <= catCount && <span className="Comp-separator">/</span>}
      <span><a onClick={props.getCategory} data-url={cat.url}>{cat.shortname}</a></span>
    </React.Fragment>
  })
}
function TagWidget(props) {
  return props.post.tags.map((tag)=>{
    return <React.Fragment key={tag.url}>
      <div className="Comp-meta-inline Comp-author"><a onClick={props.getTag} data-url={tag.url}>{tag.name}</a></div>
    </React.Fragment>
  })
}
function AuthorWidget(props) {
  return props.post.authors.map((author)=>{
    return <React.Fragment key={author.url}>
      <div className="Comp-meta-inline Comp-meta-author"><a onClick={props.getAuthor} data-url={author.url}>{author.name}</a></div>
    </React.Fragment>
  });
}

class ComponentPostList extends ComponentItemList {
  get heading() { return "All Posts" }
  get getPage() {
    return this.props.getPostList
  }
  get listObj() { return this.props.data.postList }
}
class ComponentTag extends ComponentItemList {
  get heading() { return "Tag: " + this.props.data.tag.name }
  get getPage() {
    return this.props.getTag
  }
  get listObj() { return this.props.data.tag }
}
class ComponentTagList extends Component { render() { return (<div>TagList</div>); } }
class ComponentCategory extends ComponentItemList {
  get heading() { return "Category: " + this.props.data.category.name }
  get getPage() {
    return this.props.getCategory
  }
  get listObj() { return this.props.data.category }
}
class ComponentCategoryList extends Component { render() { return (<div>CategoryList</div>); } }

class ComponentPost extends Component {
  render() {
    const thisPost = this.props.data.post;
    const date = new Date(thisPost.date)
    return (<div className="Post">
      <h3>{thisPost.title}</h3>
      <div className="Comp-meta">
        <div>Categories: <CategoryWidget post={thisPost} {...this.props}/></div>
        <div>Tags: <TagWidget post={thisPost} {...this.props}/></div>
        <div>Date: {date.toDateString()}</div>
      </div>
      <div className="Post-content" dangerouslySetInnerHTML={{__html: thisPost.content}} />
    </div>);
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: 0,
      show: {
        post: false,
        postList: true,
        tag: false,
        tagList: false,
        category: false,
        categoryList: false,
      },
      data: {
        postList: new APIPostList(),
        post: new APIPost(),
        tag: new APITag(),
        category: new APICategory(),
      }
    }
    this.getCategory = this.getListWidget.bind(this, "category");
    this.getTag = this.getListWidget.bind(this, "tag");
    this.getAuthor = this.getListWidget.bind(this, "author");
    this.getPostList = this.getListWidget.bind(this, "postList");
    this.getPost = this.getPostWidget.bind(this);
  }
  componentDidMount() {
    //update the state to triger a re-render.
    this.state.data.postList.get().then(()=>this.setState({ refresh: this.state.refresh + 1 }));
    console.log("her data fetched", this.state.data)
  }

  _mk_0month(month) {
    // give the month a zero prefix if it is less than 10 and doesn't already
    // have one
    var s = "0" + month;
    return s.substr(s.length-2);
  }
  getPostWidget(event) {
    var obj = this.state.data.post;
    const year = event.currentTarget.dataset.year;
    const month = this._mk_0month(event.currentTarget.dataset.month);
    const slug = event.currentTarget.dataset.slug;
    // We really need to tell the api how to do this...
    obj.data.url = "/posts/"+year+"/"+month+"/"+slug+".json"
    obj.get()
    .then(()=>{
      console.log("data fetched for page ",year, month, slug, this.state.data)
      this.showWidget('post')
    });

  }
  getListWidget(name, event) {
    console.log(this.constructor.name+" getListWidget "+ name, event.currentTarget.dataset)
    const url = event.currentTarget.dataset.url;
    const obj = this.state.data[name];
    if (obj) {
      var logFor = "";
      if (url) {
        // we don't have much choice, the API doesn't provide the slug, the
        // category/tag name is not the same.
        obj.data.url = url;
        logFor = url;
      } else {
        const page = event.currentTarget.dataset.page;
        const slug = event.currentTarget.dataset.slug;
        if (obj.url_fmt) {
          obj.data.url = obj.url_fmt.replace("{N}", (page === "1" || page === 1)?"":page);
          if (slug) {
            obj.data.url = obj.data.url.replace("{slug}", slug);
          }
          logFor = obj.data.url;
        } else {
          console.log(obj)
          throw Error(name+ " has no url in its data.")
        }
      }
      obj.get()
        .then(()=>{
          console.log("data fetched for "+logFor, this.state.data)
          this.showWidget(name)
        });
    } else {
      throw Error("unknown widget: "+name)
    }
  }

  showWidget(name) {
    var show = this.state.show;
    for (var widget in this.state.show) {
      show[widget] = widget===name;
    }
    this.setState({show: show})
  }
  render() {
    const events = {
      getCategory: this.getCategory,
      getTag: this.getTag,
      getAuthor: this.getAuthor,
      getPostList: this.getPostList,
      getPost: this.getPost,
    }
    return (
      <div id="layout" className="pure-g">
        <div class="sidebar pure-u-1 pure-u-md-1-4">
            <div class="header">
                <h2 class="brand-title">Static, Restful, Reactive.</h2>
                <p class="brand-tagline">A developer blog and information archive</p>
                <p>A react based site blog, with a pelican to JSON restful core.</p>
                <p class="brand-disclaimer">This site consists of notes built up over the years. Information may be out of date, or just false. The state of the world changes, and the world is a place of learning.</p>
                <img src={logo} className="App-logo" alt="logo" />
                <div><sup>(r{this.state.refresh})</sup></div>
            </div>
        </div>
        <div class="content pure-u-1 pure-u-md-3-4">
          <div className="App-content">
            { this.state.show.post && <ComponentPost {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.postList && <ComponentPostList {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.tag && <ComponentTag {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.tagList && <ComponentTagList show={this.state.show}/> }
            { this.state.show.category && <ComponentCategory {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.categoryList && <ComponentCategoryList show={this.state.show}/> }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
