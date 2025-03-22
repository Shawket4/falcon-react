import React from 'react';

function TruckDiagram({ positions, onPositionClick, onRemoveTire }) {
  // Helper to filter positions by type
  const getPositionsByType = (positionType) => {
    return positions.filter(pos => pos.position_type === positionType)
      .sort((a, b) => a.position_index - b.position_index);
  };

  // Get various position groups
  const steeringPositions = getPositionsByType('steering');
  const headAxle1Positions = getPositionsByType('head_axle_1');
  const headAxle2Positions = getPositionsByType('head_axle_2');
  const trailerAxle1Positions = getPositionsByType('trailer_axle_1');
  const trailerAxle2Positions = getPositionsByType('trailer_axle_2');
  const trailerAxle3Positions = getPositionsByType('trailer_axle_3');
  const trailerAxle4Positions = getPositionsByType('trailer_axle_4');
  const sparePositions = getPositionsByType('spare');

  // Get a readable label for the side
  const getSideLabel = (side) => {
    switch(side) {
      case 'left': return 'Outer L';
      case 'inner_left': return 'Inner L';
      case 'inner_right': return 'Inner R';
      case 'right': return 'Outer R';
      case 'none': return '';
      default: return side;
    }
  };

  // Render a single tire position
  const renderTirePosition = (position) => {
    const tireName = position.tire ? position.tire.serial : 'Empty';
    const hasWheelInstalled = position.tire !== null;
    
    return (
      <div 
        key={position.ID} 
        className={`group relative rounded-full flex flex-col items-center justify-center cursor-pointer transition-all
                    ${hasWheelInstalled 
                      ? 'bg-blue-100 hover:bg-blue-200' 
                      : 'bg-gray-100 hover:bg-gray-200'}`}
        style={{
          width: '70px',
          height: '70px',
          boxShadow: hasWheelInstalled ? '0 0 0 3px #2563eb, 0 4px 6px rgba(0,0,0,0.1)' : '0 0 0 2px #9ca3af, 0 4px 6px rgba(0,0,0,0.1)',
          border: hasWheelInstalled ? 'none' : '2px dashed #6b7280',
        }}
        onClick={() => onPositionClick(position)}
      >
        {/* Tire tread pattern visualization for installed tires */}
        {hasWheelInstalled && (
          <div className="absolute inset-2 rounded-full border-4 border-blue-400 opacity-30"></div>
        )}
        
        <div className="text-xs font-semibold text-gray-700 mb-1">
          {getSideLabel(position.side)}
        </div>
        <div className={`text-xs font-bold text-center ${hasWheelInstalled ? 'text-blue-800' : 'text-gray-500'}`}>
          {tireName}
        </div>
        
        {/* Position status badge - show on hover */}
        <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-xs font-bold px-1 rounded">
          {position.position_index}
        </div>
        
        {/* Remove button - only show for installed tires */}
        {hasWheelInstalled && (
          <button 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center 
                      hover:bg-red-600 transition-all opacity-90 hover:opacity-100 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTire(position.ID);
            }}
            aria-label="Remove tire"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Render a row of tires for an axle with proper side indication
  const renderAxleTires = (positions) => {
    // Sort left to right
    const leftSide = positions.filter(p => p.side === 'left' || p.side === 'inner_left')
      .sort((a, b) => {
        // Ensure outer left comes before inner left
        if (a.side === 'left' && b.side === 'inner_left') return -1;
        if (a.side === 'inner_left' && b.side === 'left') return 1;
        return a.position_index - b.position_index;
      });
      
    const rightSide = positions.filter(p => p.side === 'right' || p.side === 'inner_right')
      .sort((a, b) => {
        // Ensure inner right comes before outer right
        if (a.side === 'inner_right' && b.side === 'right') return -1;
        if (a.side === 'right' && b.side === 'inner_right') return 1;
        return a.position_index - b.position_index;
      });

    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Left side wheels */}
        <div className="flex gap-3">
          {leftSide.map(renderTirePosition)}
        </div>
        
        {/* Axle visualization */}
        <div className="h-1 w-12 sm:w-24 bg-gray-400 self-center"></div>
        
        {/* Right side wheels */}
        <div className="flex gap-3">
          {rightSide.map(renderTirePosition)}
        </div>
      </div>
    );
  };

  // Section component
  const Section = ({ title, children, highlighted = false }) => (
    <div className={`mb-6 bg-white p-5 rounded-lg shadow ${highlighted ? 'border-l-4 border-blue-500' : 'border border-gray-200'}`}>
      <h5 className="text-left text-sm font-semibold mb-4 text-gray-700 uppercase tracking-wider">{title}</h5>
      <div className="flex justify-center">
        {children}
      </div>
    </div>
  );

  // Truck visual component
  const TruckVisual = () => (
    <div className="my-6 flex justify-center opacity-10 absolute left-0 right-0 pointer-events-none">
      <svg width="800" height="200" viewBox="0 0 800 200">
        <path d="M100,100 L200,100 L230,70 L400,70 L400,130 L100,130 Z" fill="#333" />
        <path d="M400,70 L750,70 L750,130 L400,130 Z" fill="#666" />
      </svg>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      {/* Main container */}
      <div className="relative">
        {/* Background truck silhouette */}
        <TruckVisual />
        
        <div className="relative z-10">
          {/* Truck Head Section */}
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-blue-50 to-transparent p-2 rounded-lg">
              Truck Head
            </h3>
            
            <div className="space-y-6">
              {/* Steering Section */}
              <Section title="Steering Axle" highlighted={true}>
                {renderAxleTires(steeringPositions)}
              </Section>
              
              {/* Head Axles */}
              <Section title="Drive Axle 1">
                {renderAxleTires(headAxle1Positions)}
              </Section>
              
              <Section title="Drive Axle 2">
                {renderAxleTires(headAxle2Positions)}
              </Section>
            </div>
          </div>
          
          {/* Truck Trailer Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-blue-50 to-transparent p-2 rounded-lg">
              Trailer
            </h3>
            
            <div className="space-y-6">
              {/* Trailer Axles */}
              <Section title="Trailer Axle 1">
                {renderAxleTires(trailerAxle1Positions)}
              </Section>
              
              <Section title="Trailer Axle 2">
                {renderAxleTires(trailerAxle2Positions)}
              </Section>
              
              <Section title="Trailer Axle 3">
                {renderAxleTires(trailerAxle3Positions)}
              </Section>
              
              <Section title="Trailer Axle 4">
                {renderAxleTires(trailerAxle4Positions)}
              </Section>
            </div>
          </div>
          
          {/* Spare Tires */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-yellow-50 to-transparent p-2 rounded-lg">
              Spare Tires
            </h3>
            
            <Section title="Available Spares">
              <div className="flex flex-wrap justify-center gap-4">
                {sparePositions.map(renderTirePosition)}
              </div>
            </Section>
          </div>
          
          {/* Legend */}
          <div className="mt-10 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h5 className="text-center text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wider">Legend</h5>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center">
                <div className="rounded-full w-6 h-6 bg-blue-100 mr-2" 
                     style={{boxShadow: '0 0 0 3px #2563eb'}}></div>
                <span className="text-sm text-gray-600">Tire Installed</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full w-6 h-6 bg-gray-100 border-2 border-dashed border-gray-400 mr-2"></div>
                <span className="text-sm text-gray-600">Empty Position</span>
              </div>
              <div className="flex items-center">
                <div className="rounded-full w-6 h-6 relative mr-2">
                  <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs font-bold px-1 rounded">1</div>
                </div>
                <span className="text-sm text-gray-600">Position Index</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TruckDiagram;