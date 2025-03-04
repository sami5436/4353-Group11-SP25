import React from 'react'
import { Users, Target, Heart } from 'lucide-react'

function AboutUs() {
  return (
    <>
      <div className="fixed top-0 left-0 z-[-1] h-full w-full rotate-180 bg-gradient-to-b from-emerald-600 to-emerald-900"></div>

      <div className="relative min-h-screen w-full text-white">
        <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-50">
          <div className="max-w-3xl w-full text-6xl font-bold mb-5 text-center">
            Our <span className="inline-block text-[#E8CDA2]">Mission</span>
          </div>
          <div className="max-w-3xl w-full text-base text-center mx-auto mb-10">
            We believe in the power of community and the transformative impact of volunteerism. 
            Our platform is designed to bridge the gap between passionate individuals and 
            organizations making a real difference.
          </div>

          <div className="w-full mb-10 m-10 p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community-Driven</h3>
                <p className="text-sm text-gray-600">
                  We're more than a platform – we're a community of changemakers 
                  committed to creating positive impact through collaborative volunteerism.
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                <p className="text-sm text-gray-600">
                  To empower every individual to contribute meaningfully to their 
                  community, breaking down barriers between volunteers and organizations.
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Our Values</h3>
                <p className="text-sm text-gray-600">
                  Transparency, empowerment, and genuine social impact. We strive to 
                  create meaningful connections that drive real, sustainable change.
                </p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  )
}

export default AboutUs