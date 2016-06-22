var my_news = [
	{
		author: 'John McNelly',
		text: 'Hello. Its John, going to hunt the bear ',
		fullText: 'right now. This is a huge one. But our hero isnt scaried.'
	},
	{
		author: "NickMihale",
		text: "Today Ive passed ",
		fullText: "the Stockhastic Processes Theory exam. Ive had an A degree. Im so happy now!"
	},
	{
		author: "Alex Tailor",
		text: "Breaking news! World famous actress ",
		fullText: "have not done anything today. What a sadness."
	}		
];

window.ee = new EventEmitter();


var News = React.createClass({
	propTypes: {
		data: React.PropTypes.array.isRequired
	},
	render: function(){
		var data = this.props.data;
		var newsTemp;
		if (data.length > 0){
			newsTemp = data.map(function(item, index) {
				return (
					<div key={index}>
						<Article data={item} />
					</div>
				);
			}) 
		} else {
			newsTemp = <p>There's no news yet</p>
		}

		return (
			<div className="news">
				{newsTemp}
				<strong className={'news_count ' + (data.length > 0 ? '' : 'none')}>Total news: {data.length}</strong>
			</div>
		);
	}
});

var Article = React.createClass({
	propTypes: {
		data: React.PropTypes.shape({
			author: React.PropTypes.string.isRequired,
			text: React.PropTypes.string.isRequired,
			fullText: React.PropTypes.string
		})
	},
	getInitialState: function() {
		return {
			visible: false
		}
 	},
 	readMoreClick: function(e) {
 		e.preventDefault();
 		this.setState({visible: true});
 	},
	render: function() {
		var author = this.props.data.author;
		var text = this.props.data.text;
		var fullText = this.props.data.fullText;
		var visible = this.state.visible;

		return (
			<div className="article">
				<p className="news_author">{author}:</p>
				<p className="news_text">{text}</p>
				<a href="#" className={'news_readmore ' + (visible ? 'none' : '')} onClick={this.readMoreClick}>Read more</a> 
				<p className={'news_full_text ' + (visible ? '' : 'none')}>{fullText}</p>
			</div>
		);
	}
});

var Add = React.createClass({
	componentDidMount: function() {
		ReactDOM.findDOMNode(this.refs.author).focus();
	},

	onButtonClick: function(e) {
		e.preventDefault();
		var author = ReactDOM.findDOMNode(this.refs.author).value;
		var text = ReactDOM.findDOMNode(this.refs.text).value;

		var item=[{
			author: author,
			text: text,
			fullText: '...'
		}];

		window.ee.emit('News.add', item);

		ReactDOM.findDOMNode(this.refs.text).value = '';
		this.setState({textIsEmpty: true});
	},
	
	getInitialState: function() {
		return {
			agreeNotChecked: true,
			authorIsEmpty: true,
			textIsEmpty: true
		};
	},
	
	onCheckRuleClick: function() {
		this.setState({agreeNotChecked: !this.state.agreeNotChecked});
	},
	
	onFieldChange: function(field, e){
		if (e.target.value.trim().length > 0){
			this.setState({[''+field]: false});
		} else {
			this.setState({[''+field]: true});
		}
	},
	
	render: function() {
		return (
			<div>
				<form className="add cf">
					<input type='text' className="add_author" defaultValue='' placeholder="Your name" ref='author' onChange={this.onFieldChange.bind(this, 'authorIsEmpty')}/>
					<textarea className="add_text" defaultValue='' placeholder="Your text" ref='text' onChange={this.onFieldChange.bind(this, 'textIsEmpty')}></textarea>
					<br/>
					<label className="add_cleckrule" >
						<input type='checkbox' ref='checkrule' onChange={this.onCheckRuleClick} />I agree with rules
					</label>	
					<button className='add_btn' onClick={this.onButtonClick} ref='button' 
					disabled={(this.state.authorIsEmpty || this.state.textIsEmpty || this.state.agreeNotChecked)}>Add the news</button>
				</form>
			</div>	
		);
	}
})

var App = React.createClass({
	getInitialState: function(){
		return {
			news: my_news
		};
	},
	componentDidMount: function(){
		var self = this;
		window.ee.addListener('News.add', function(item){
			var nextNews = item.concat(self.state.news);
			self.setState({news: nextNews});
		});
	},
	componentWillUnmount: function(){
		window.ee.removeListener('News.add');
	},
	render: function(){
		return (
			<div className="app">
				<h3>News</h3>
				<Add />
				<News data={this.state.news} />
			</div>
		);
	}
});

ReactDOM.render(<App />, document.getElementById('root'));