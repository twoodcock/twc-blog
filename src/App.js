import React, { Component } from 'react';
import Route from 'route-parser';
import logo from './logo.svg';
import './App.css';
import './App-menu.css';
import createHistory from 'history/createBrowserHistory';

// API imports
import BlogAPI from './BlogAPI/APIObjects';

// Component imports
import PostListComponents from './Components/PostLists';
import { PostComponent, PageComponent } from './Components/Page';

// class TagList extends Component { render() { return (<div>TagList</div>); } }
// class ComponentCategoryList extends Component { render() { return (<div>CategoryList</div>); } }

import SidebarComponents from './Components/Sidebar';

export function ErrorComponent(props) {
  console.log("error got props: ", props)
  return <div className="App-error">{props.error.message}</div>
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: 0,
      show: {
        page: false,
        post: false,
        postList: true,
        tag: false,
        tagList: false,
        category: false,
        categoryList: false,
        error: false,
      },
      data: {
        postList: new BlogAPI.PostList(),
        post: new BlogAPI.Post(),
        page: new BlogAPI.Page(),
        tag: new BlogAPI.Tag(),
        category: new BlogAPI.Category(),
        tagList: new BlogAPI.TagList(),
        categoryTree: new BlogAPI.CategoryTree(),
      },
      history: createHistory(),
      hasLoaded: false,
      error: null,
    }
    this.getCategory = this.getListWidget.bind(this, "category");
    this.getTag = this.getListWidget.bind(this, "tag");
    this.getAuthor = this.getListWidget.bind(this, "author");
    this.getPostList = this.getListWidget.bind(this, "postList");
    this.getPost = this.getPostWidget.bind(this);
    this.getPage = this.getPageWidget.bind(this);

    // Allow the test to specify a location.
    if (props.location) {
      this.state.history.push(props.location)
    }
  }
  componentDidMount() {
    //update the state to triger a re-render.
    const unlisten = this.state.history.listen((location, action) => {
      // we might want to include location.state.
      this.getRoute(location.pathname);
    })
    this.setState({
      unlisten: unlisten,
      refresh: this.state.refresh + 1,
    })
    // Now we need to set the state according to the current path.
    this.getRoute(this.state.history.location.pathname);
  }
  componentWillUnmount() {
    this.state.unlisten();
  }

  _mk_0month(month) {
    // give the month a zero prefix if it is less than 10 and doesn't already
    // have one
    var s = "0" + month;
    return s.substr(s.length-2);
  }

  /* getPageWidget(event) -  Handle an event that triggers a page.
   */
  getPageWidget(event) {
    event.preventDefault();
    var obj = this.state.data.page;
    const slug = event.currentTarget.dataset.slug;
    var target = obj.urlFor({ slug: slug })
    this.state.history.push(target)
  }

  /* getPageWidget(event) -  Handle an event that triggers a post.
   */
  getPostWidget(event) {
    event.preventDefault();
    var obj = this.state.data.post;
    const year = event.currentTarget.dataset.year;
    const month = this._mk_0month(event.currentTarget.dataset.month);
    const slug = event.currentTarget.dataset.slug;
    var target = obj.urlFor({ year: year, month: month, slug: slug })
    this.state.history.push(target)
  }

  /* getPageWidget(event) -  Handle an event that triggers any list widget.
   *
   * used to generate getCategory, getTag, getAuthor, getPostList.
   */
  getListWidget(name, event) {
    event.preventDefault();
    const obj = this.state.data[name];
    if (obj) {
      this.state.history.push(event.currentTarget.dataset.target)
    } else {
      throw Error("unknown widget: "+name)
    }
  }

  /* fromLocation(location)
   *
   * Parse the location and return a set of matches.
   */
  fromLocation(route) {
    // trim possible extensions from the location.
    route = route.replace(/\.(html|json)$/, "")
    const routes = {
      category: new Route("/categor(y)(ies)/*slug(/p/:page)"),
      tag: new Route("/tag(s)/:slug(/p/:page)"),
      post: new Route("/post(s)/:year/:month/:slug"),
      page: new Route("/page(s)/:slug"),
      postList: new Route("/(index)(/p/:page)"),
    };
    for (let key in routes) {
      var matched = routes[key].match(route);
      if (matched) {
        matched.name = key;
        return matched;
      }
    }
  }

  /* makePromises(mainRequestPromise)
   *
   * Merge the request promise with other promises we need to make to complete
   * the page. In this case, only on the first request, we will need the tag
   * list and category tree.
   *
   * * This technique is not manditory.
   * * It means all data can be in the core of the application to be shared
   *   with (for example) sidebar widgets.
   * * It means we only render once per request.
   *
   * React has a problem in that it encourages loops within loops and worse:
   * it encourages dynamic function definitions inside nested loops. True, it
   * is supposed to limit unnecessary rendering, but mistakes happen. If we
   * reduce the number of renders, the application will be faster.
   *
   */
  makePromises(mainPromise) {
    var promises = [mainPromise];
    if (this.state.data.tagList.length === 0) {
      promises.push(this.state.data.tagList.get());
    }
    if (this.state.data.categoryTree.length === 0) {
      promises.push(this.state.data.categoryTree.get());
    }
    return Promise.all(promises);
  }

  /* getRoute(location)
   *
   * Handle a location change. Determines what should be rendered from the
   * location (using fromLocation()), gets the data from the API and sets the
   * state using showWidget, triggering a re-rendering of the app component.
   */
  getRoute(path) {
    if (!path) {
      path = this.history.location.pathname;
    }
    const data = this.fromLocation(path);
    var obj;
    if (data) {
      obj = this.state.data[data.name];
      if (obj) {
        // intrude up the object... because we have to and simpler.
        // fixme? we should be able to do 'obj.url = value.'
        obj.setValue('url', obj.urlFor(data) + ".json");
      }
    }
    if (!obj) {
      this.showWidget({ name: 'error', error: { message: "unknown request: "+path, location: data }});
      return;
    }
    this.makePromises(obj.get())
    .then((loaded) => {
      this.showWidget({ name: data.name});
    })
    .catch((error) =>{
      this.showWidget({ name: 'error', error: error });
    });

  }

  showWidget(props) {
    var show = this.state.show;
    for (var widget in this.state.show) {
      show[widget] = widget===props.name;
    }
    this.setState({
      show: show,
      refresh: this.state.refresh+1,
      hasLoaded: true,
      error: props.error, // always set the error: if undefined, great.
    })
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
        <div className="sidebar pure-u-1 pure-u-md-1-4">
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2 className="App-title"><a href="/" onClick={this.getPostList} data-target="/">Static,<br/>Restful,<br/>Reactive.</a></h2>
                <p className="App-tagline">Developer notes by Tim Woodcock.</p>
                <p className="App-description">A react based site blog, with a pelican to JSON restful core.</p>
                <p className="App-disclaimer">This site consists of notes built up over the years. Information may be out of date, or just false. The state of the world changes, and the world is a place of learning.</p>
                <div><sup>(r{this.state.refresh})</sup></div>
            </div>
            <nav>
              <label htmlFor="drop" className="toggle">Menu</label>
              <input type="checkbox" id="drop" />
              <ul className="menu">
                <li className="pure-menu-item"><a href="about-this-site" onClick={this.getPage} data-slug="about-this-site" className="pure-menu-link">About This Site</a></li>
                <li className="pure-menu-heading">Tim Woodcock</li>
                <li className="pure-menu-item"><a href="resume" onClick={this.getPage} data-slug="resume" className="pure-menu-link">Résumé</a></li>
                <li className="pure-menu-item">{true && <SidebarComponents.CategoryTreeTL categoryTree={this.state.data.categoryTree} getCategory={events['getCategory']} />}</li>
                <li className="pure-menu-item">{true && <SidebarComponents.TagList tagList={this.state.data.tagList} getTag={events['getTag']} /> }</li>
              </ul>
            </nav>
        </div>
        <div className="content pure-u-1 pure-u-md-3-4">
          <div className="App-content">
            { this.state.show.error && <ErrorComponent error={this.state.error}/> }
            { this.state.show.page && <PageComponent {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.post && <PostComponent {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.postList && <PostListComponents.PostList {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.tag && <PostListComponents.TaggedPosts {...events} data={this.state.data} show={this.state.show}/> }
            { this.state.show.category && <PostListComponents.CategoryPosts {...events} data={this.state.data} show={this.state.show}/> }
          </div>
        </div>
      </div>
    );
            // { this.state.show.tagList && <ComponentTagList show={this.state.show}/> }
            // { this.state.show.categoryList && <ComponentCategoryList show={this.state.show}/> }
  }
}

export default App;
