import React from 'react';
import { Stage, Layer, Rect, Arrow, Text, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Project } from '../../types/project';

interface ArchitectureDiagramProps {
  project: Project;
}

interface Component {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: 'service' | 'database' | 'external' | 'ui';
}

interface Connection {
  id: string;
  from: string;
  to: string;
  text?: string;
}

export default function ArchitectureDiagram({ project }: ArchitectureDiagramProps) {
  const [components, setComponents] = React.useState<Component[]>([
    {
      id: '1',
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      text: 'Frontend App',
      type: 'ui',
    },
    {
      id: '2',
      x: 300,
      y: 100,
      width: 120,
      height: 60,
      text: 'API Gateway',
      type: 'service',
    },
    {
      id: '3',
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      text: 'Auth Service',
      type: 'service',
    },
  ]);

  const [connections, setConnections] = React.useState<Connection[]>([
    {
      id: '1',
      from: '1',
      to: '2',
      text: 'REST API',
    },
    {
      id: '2',
      from: '2',
      to: '3',
      text: 'JWT Auth',
    },
  ]);

  const [selectedComponent, setSelectedComponent] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(true);
    const id = e.target.id();
    setSelectedComponent(id);
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const id = e.target.id();
    const component = components.find(c => c.id === id);
    if (component) {
      const newComponents = components.map(c => 
        c.id === id ? { ...c, x: e.target.x(), y: e.target.y() } : c
      );
      setComponents(newComponents);
    }
  };

  const getComponentColor = (type: Component['type']) => {
    switch (type) {
      case 'service':
        return '#3B82F6';
      case 'database':
        return '#10B981';
      case 'external':
        return '#F59E0B';
      case 'ui':
        return '#6366F1';
      default:
        return '#6B7280';
    }
  };

  const renderComponent = (component: Component) => (
    <Group
      key={component.id}
      id={component.id}
      x={component.x}
      y={component.y}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={component.width}
        height={component.height}
        fill={getComponentColor(component.type)}
        opacity={0.8}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      <Text
        text={component.text}
        width={component.width}
        height={component.height}
        align="center"
        verticalAlign="middle"
        fill="white"
        fontSize={14}
        fontFamily="sans-serif"
      />
    </Group>
  );

  const renderConnection = (connection: Connection) => {
    const fromComponent = components.find(c => c.id === connection.from);
    const toComponent = components.find(c => c.id === connection.to);

    if (!fromComponent || !toComponent) return null;

    const points = [
      fromComponent.x + fromComponent.width,
      fromComponent.y + fromComponent.height / 2,
      toComponent.x,
      toComponent.y + toComponent.height / 2,
    ];

    const textX = (points[0] + points[2]) / 2;
    const textY = (points[1] + points[3]) / 2 - 15;

    return (
      <React.Fragment key={connection.id}>
        <Arrow
          points={points}
          stroke="#94A3B8"
          strokeWidth={2}
          fill="#94A3B8"
          pointerLength={8}
          pointerWidth={8}
        />
        {connection.text && (
          <Text
            x={textX}
            y={textY}
            text={connection.text}
            fontSize={12}
            fill="#64748B"
            align="center"
            width={100}
            offsetX={50}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Architecture Diagram</h2>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Add Component
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Add Connection
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Stage width={800} height={600}>
            <Layer>
              {connections.map(renderConnection)}
              {components.map(renderComponent)}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}