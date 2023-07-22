// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.18.1
// source: internal.proto

package protos

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// InternalClient is the client API for Internal service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type InternalClient interface {
	// Initial method that an SDK should call to register itself with the server.
	// The server will use this stream to send commands to the SDK via the
	// `CommandResponse` message. Clients should continuously listen for
	// CommandResponse messages and re-establish registration if the stream gets
	// disconnected.
	Register(ctx context.Context, in *RegisterRequest, opts ...grpc.CallOption) (Internal_RegisterClient, error)
	// SDK is responsible for sending heartbeats to the server to let the server
	// know about active consumers and producers.
	Heartbeat(ctx context.Context, in *HeartbeatRequest, opts ...grpc.CallOption) (*StandardResponse, error)
	// Use this method when Notify condition has been triggered; the server will
	// decide on what to do about the notification.
	Notify(ctx context.Context, in *NotifyRequest, opts ...grpc.CallOption) (*StandardResponse, error)
	// Send periodic metrics to the server
	Metrics(ctx context.Context, in *MetricsRequest, opts ...grpc.CallOption) (*StandardResponse, error)
}

type internalClient struct {
	cc grpc.ClientConnInterface
}

func NewInternalClient(cc grpc.ClientConnInterface) InternalClient {
	return &internalClient{cc}
}

func (c *internalClient) Register(ctx context.Context, in *RegisterRequest, opts ...grpc.CallOption) (Internal_RegisterClient, error) {
	stream, err := c.cc.NewStream(ctx, &Internal_ServiceDesc.Streams[0], "/protos.Internal/Register", opts...)
	if err != nil {
		return nil, err
	}
	x := &internalRegisterClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type Internal_RegisterClient interface {
	Recv() (*CommandResponse, error)
	grpc.ClientStream
}

type internalRegisterClient struct {
	grpc.ClientStream
}

func (x *internalRegisterClient) Recv() (*CommandResponse, error) {
	m := new(CommandResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *internalClient) Heartbeat(ctx context.Context, in *HeartbeatRequest, opts ...grpc.CallOption) (*StandardResponse, error) {
	out := new(StandardResponse)
	err := c.cc.Invoke(ctx, "/protos.Internal/Heartbeat", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *internalClient) Notify(ctx context.Context, in *NotifyRequest, opts ...grpc.CallOption) (*StandardResponse, error) {
	out := new(StandardResponse)
	err := c.cc.Invoke(ctx, "/protos.Internal/Notify", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *internalClient) Metrics(ctx context.Context, in *MetricsRequest, opts ...grpc.CallOption) (*StandardResponse, error) {
	out := new(StandardResponse)
	err := c.cc.Invoke(ctx, "/protos.Internal/Metrics", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// InternalServer is the server API for Internal service.
// All implementations must embed UnimplementedInternalServer
// for forward compatibility
type InternalServer interface {
	// Initial method that an SDK should call to register itself with the server.
	// The server will use this stream to send commands to the SDK via the
	// `CommandResponse` message. Clients should continuously listen for
	// CommandResponse messages and re-establish registration if the stream gets
	// disconnected.
	Register(*RegisterRequest, Internal_RegisterServer) error
	// SDK is responsible for sending heartbeats to the server to let the server
	// know about active consumers and producers.
	Heartbeat(context.Context, *HeartbeatRequest) (*StandardResponse, error)
	// Use this method when Notify condition has been triggered; the server will
	// decide on what to do about the notification.
	Notify(context.Context, *NotifyRequest) (*StandardResponse, error)
	// Send periodic metrics to the server
	Metrics(context.Context, *MetricsRequest) (*StandardResponse, error)
	mustEmbedUnimplementedInternalServer()
}

// UnimplementedInternalServer must be embedded to have forward compatible implementations.
type UnimplementedInternalServer struct {
}

func (UnimplementedInternalServer) Register(*RegisterRequest, Internal_RegisterServer) error {
	return status.Errorf(codes.Unimplemented, "method Register not implemented")
}
func (UnimplementedInternalServer) Heartbeat(context.Context, *HeartbeatRequest) (*StandardResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Heartbeat not implemented")
}
func (UnimplementedInternalServer) Notify(context.Context, *NotifyRequest) (*StandardResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Notify not implemented")
}
func (UnimplementedInternalServer) Metrics(context.Context, *MetricsRequest) (*StandardResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Metrics not implemented")
}
func (UnimplementedInternalServer) mustEmbedUnimplementedInternalServer() {}

// UnsafeInternalServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to InternalServer will
// result in compilation errors.
type UnsafeInternalServer interface {
	mustEmbedUnimplementedInternalServer()
}

func RegisterInternalServer(s grpc.ServiceRegistrar, srv InternalServer) {
	s.RegisterService(&Internal_ServiceDesc, srv)
}

func _Internal_Register_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(RegisterRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(InternalServer).Register(m, &internalRegisterServer{stream})
}

type Internal_RegisterServer interface {
	Send(*CommandResponse) error
	grpc.ServerStream
}

type internalRegisterServer struct {
	grpc.ServerStream
}

func (x *internalRegisterServer) Send(m *CommandResponse) error {
	return x.ServerStream.SendMsg(m)
}

func _Internal_Heartbeat_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(HeartbeatRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(InternalServer).Heartbeat(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protos.Internal/Heartbeat",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(InternalServer).Heartbeat(ctx, req.(*HeartbeatRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Internal_Notify_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(NotifyRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(InternalServer).Notify(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protos.Internal/Notify",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(InternalServer).Notify(ctx, req.(*NotifyRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Internal_Metrics_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(MetricsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(InternalServer).Metrics(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protos.Internal/Metrics",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(InternalServer).Metrics(ctx, req.(*MetricsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// Internal_ServiceDesc is the grpc.ServiceDesc for Internal service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var Internal_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "protos.Internal",
	HandlerType: (*InternalServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Heartbeat",
			Handler:    _Internal_Heartbeat_Handler,
		},
		{
			MethodName: "Notify",
			Handler:    _Internal_Notify_Handler,
		},
		{
			MethodName: "Metrics",
			Handler:    _Internal_Metrics_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "Register",
			Handler:       _Internal_Register_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "internal.proto",
}
