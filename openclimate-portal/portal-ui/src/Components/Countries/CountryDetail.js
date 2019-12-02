import React, { Component } from 'react'

import CountryContext, {selectedCountry} from "../../Contexts/CountryContext";



import {Jumbotron, Card, CardTitle, CardText} from 'reactstrap';
import PledgeDetail from "../Cards/PledgeDetail";



class CountryDetail extends Component {

    constructor(props) {
        super(props)


    }


    state = {
        render: [],
        passed_country_name: [],
        country_emmissions_pledges: [],
        selected_country: []
    }


    getEmissionsPledgesForCountry(selected_country) {
        console.log('Selected: '+selected_country);
        if (selected_country) {
            fetch('http://localhost:3000/getEmissionsPledgesForCountry?countryName=' + selected_country)
                .then(response => response.json())
                .then(country_emissions_pledges => this.updateState({country_emissions_pledges}))
                .catch(err => console.log(err))
        }
    }

    updateState(emissions_pledges) {


            if ((emissions_pledges.country_emissions_pledges['dataExists'] != 'false') && (emissions_pledges.country_emissions_pledges['dbError'] != 'db error')) {

                document.getElementById("latest_reported_amount").innerText = emissions_pledges.country_emissions_pledges[0].total_emissions;

            } else {

                document.getElementById("latest_reported_amount").innerText = 'N/R';

            }

            if ((emissions_pledges.country_emissions_pledges[0].total_pledges.length > 0)) {

                document.getElementById("latest_reported_pledges").innerText = '';

                document.getElementById("latest_reported_pledges").innerHTML = '';

                emissions_pledges.country_emissions_pledges[0].total_pledges.map(pledge => {

                    var year = pledge.year;

                    var value = pledge.value;

                    var label = pledge.label;


                    var leftAlignDiv = document.createElement('DIV');
                    leftAlignDiv.className = 'left_align_div';
                    leftAlignDiv.style.textAlign = 'left';

                    var yeartextnode = document.createElement('SPAN');
                    yeartextnode.className = 'latest_reported_pledges_inner_year';

                    yeartextnode.innerText =  year;


                    var valuetextnode = document.createElement('SPAN');
                    valuetextnode.className = 'latest_reported_pledges_inner_value';

                    valuetextnode.innerText =  value;

                    var labeltextnode = document.createElement('SPAN');
                    labeltextnode.className = 'latest_reported_pledges_inner_label';
                    labeltextnode.style.textAlign = 'right';
                    labeltextnode.style.float = 'right';
                    labeltextnode.style.paddingRight = '20px';


                    labeltextnode.innerText =  label;

                    var br = document.createElement('BR');

                    document.getElementById("latest_reported_pledges").appendChild(leftAlignDiv);

                    var innerDiv = document.querySelector('.left_align_div');

                    innerDiv.appendChild(yeartextnode);
                    innerDiv.appendChild(valuetextnode);

                    innerDiv.appendChild(labeltextnode);
                    innerDiv.appendChild(br);


                    var elem = document.querySelector('#latest_reported_pledges');
                    elem.style.fontSize = '15px';






                });


            } else {

                console.log('Pledges: '+JSON.stringify(emissions_pledges.country_emissions_pledges[0].total_pledges));
            }

            this.state.country_emissions_pledges = emissions_pledges.country_emissions_pledges;


    }




    componentDidMount(){
       // this.getEmissionsPledgesForCountry();


    }

    render() {

        return (

                <CountryContext.Consumer>
                    {

                        (selectedCountry) => (
                            <div>
                                <Jumbotron>
                                    <h4 className="display-5">{this.getEmissionsPledgesForCountry(selectedCountry)}{selectedCountry}</h4>
                                    <Card body>
                                        <img id="company_detail_background" src="../../../../country_detail_background.png"/>

                                        <div id="latest_reported_amount"></div>

                                        <div id="latest_reported_pledges" ></div>

                                    </Card>


                                </Jumbotron>
                            </div>
                        )
                    }
                </CountryContext.Consumer>
            )


    }
}

export default CountryDetail;
