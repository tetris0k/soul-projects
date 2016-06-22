var Shopping = React.createClass({
    getInitialState: function(){
        return {
            total: 0
        };
    },

    addTotal: function(price){
        this.setState({total: this.state.total + price});
    },

    render: function() {
        var self = this;
        var i = 1;
        var goods = this.props.items.map(function(it){
            ++i;
            return <Item key={i} name={it.name} price={it.price} active={it.active} addTotal={self.addTotal} />;
        });
        return (
            <div>
                <h1>Our goods</h1>                 
                <div id="goods">
                    {goods}
                    <p id="total">Total ${this.state.total.toFixed(2)}</p>
                </div>
            </div>
        );

    }
});


var Item = React.createClass({
    getInitialState: function(){
        return { 
            active: false 
        };
    },

    clickHandler: function (){
        this.setState({active: !this.state.active });
        this.props.addTotal( (!this.state.active) ? this.props.price : -this.props.price );

    },

    render: function(){
        return  (
            <div className={'item '+ (this.state.active ? 'active' : '')} onClick={this.clickHandler}>
                {this.props.name} ${this.props.price.toFixed(2)}
            </div>
        );
    }
});

var list = [
    { name: 'Meat', price: 300 },
    { name: 'table', price: 400 },
    { name: 'Milk', price: 70 },
    { name: 'Sausage', price: 220 },
    { name: 'Cherry', price: 150 },
    { name: 'Cucumbers', price: 100 }
];

ReactDOM.render(
    <Shopping items={list} />,
    document.getElementById('root')
);