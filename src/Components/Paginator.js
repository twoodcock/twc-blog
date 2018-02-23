import React, { Component } from 'react';

function PageLink(props) {
  var content;
  const target = props.listObj.urlFor({page: props.page})
  if (props.page) {
    content = (<a href={target} onClick={props.getPage} data-target={target}>{props.children}</a>);
  } else {
    content = props.children;
  }
  return (<div className={props.className}>{content}</div>);
}

export class Paginator extends Component {
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
      range.push(<PageLink {...this.props} key={i} page={i}>{content}</PageLink>)
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